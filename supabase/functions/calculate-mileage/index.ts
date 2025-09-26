const calculateMileage = async () => {
  const fromTrimmed = fromAddress.trim();
  const toTrimmed = toAddress.trim();

  if (!fromTrimmed || !toTrimmed) {
    toast({
      title: 'Missing Information',
      description: "Please enter both 'From' and 'To' addresses.",
      variant: 'destructive'
    });
    return;
  }

  // Same-origin guard (common real-world case)
  if (fromTrimmed === toTrimmed) {
    toast({
      title: 'Same locations',
      description: 'From and To are the same. Please change one of them.',
      variant: 'destructive'
    });
    return;
  }

  setIsCalculating(true);
  setError(null);
  setResult(null);

  try {
    // Canonicalize both inputs. If they are coordinates, strip spaces and drop placeId.
    const fromCanon = canonicalizeOriginDest(fromTrimmed, fromPlaceId);
    const toCanon = canonicalizeOriginDest(toTrimmed, toPlaceId);

    // Build payload for the Edge Function. Keep it simple & explicit.
    const payload: Record<string, any> = {
      from: fromCanon.fromTo,
      to: toCanon.fromTo
    };
    if (fromCanon.placeId) payload.fromPlaceId = fromCanon.placeId;
    if (toCanon.placeId) payload.toPlaceId = toCanon.placeId;

    const { data, error: fnError } = await supabase.functions.invoke('calculate-mileage', {
      body: payload
    });

    if (fnError) throw new Error(fnError.message || 'Failed to calculate mileage');

    // Expecting: { miles, origin, destination, durationText?, durationMinutes? }
    const baseMilesRaw = typeof data?.miles === 'number' ? data.miles : NaN;
    if (!Number.isFinite(baseMilesRaw) || baseMilesRaw < 0) {
      throw new Error('Distance service returned an invalid distance.');
    }

    const baseMiles = Math.round(baseMilesRaw * 10) / 10;
    const appliedMiles = isRoundTrip ? Math.round(baseMiles * 2 * 10) / 10 : baseMiles;
    const computedDeduction = Math.round(appliedMiles * IRS_RATE_2024 * 100) / 100;

    const resolvedFrom =
      (typeof data?.origin === 'string' && data.origin) || fromTrimmed;
    const resolvedTo =
      (typeof data?.destination === 'string' && data.destination) || toTrimmed;

    const duration =
      typeof data?.durationText === 'string' && Number.isFinite(Number(data?.durationMinutes))
        ? { text: data.durationText, minutes: Number(data.durationMinutes) }
        : undefined;

    const resultPayload: MileageResult = {
      from: resolvedFrom,
      to: resolvedTo,
      distance: { miles: appliedMiles, text: `${appliedMiles} miles` },
      duration,
      estimatedDeduction: computedDeduction,
      irsRate: IRS_RATE_2024
    };

    setResult(resultPayload);
    onAmountCalculated(computedDeduction);

    toast({
      title: 'Mileage Calculated!',
      description: `Distance: ${appliedMiles} miles • Total: $${computedDeduction}${isRoundTrip ? ' (round trip)' : ''}`
    });
  } catch (err) {
    let errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';

    // Map known back-end/Maps errors to clear guidance.
    if (/RefererNotAllowedMapError/i.test(errorMessage)) {
      setMapsApiError(true);
      errorMessage = `Google Maps API access is restricted for this domain. Please add ${window?.location?.origin}/* to your HTTP referrer restrictions in Google Cloud Console (APIs & Services → Credentials → API key).`;
    } else if (/DISTANCE_MATRIX|Distance Matrix API|API restriction/i.test(errorMessage)) {
      errorMessage = 'Please enable the “Distance Matrix API” and confirm billing is active for your key in Google Cloud Console.';
    } else if (/invalid distance/i.test(errorMessage)) {
      errorMessage = 'The distance service returned an invalid result. Double-check both addresses (or coordinates).';
    }

    setError(errorMessage);
    toast({ title: 'Calculation Failed', description: errorMessage, variant: 'destructive' });
  } finally {
    setIsCalculating(false);
  }
};
