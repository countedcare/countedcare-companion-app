import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface HelpTooltipProps {
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const HelpTooltip: React.FC<HelpTooltipProps> = ({
  title,
  content,
  placement = 'top',
  trigger = 'hover',
  size = 'md',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const maxWidth = {
    sm: 'max-w-xs',
    md: 'max-w-sm',
    lg: 'max-w-md'
  };

  const triggerProps = trigger === 'hover' 
    ? {
        onMouseEnter: () => setIsOpen(true),
        onMouseLeave: () => setIsOpen(false)
      }
    : {
        onClick: () => setIsOpen(!isOpen)
      };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-auto w-auto p-1 text-muted-foreground hover:text-primary ${className}`}
          {...triggerProps}
        >
          <HelpCircle className={iconSize[size]} />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        side={placement}
        className={`${maxWidth[size]} p-4 z-50`}
        sideOffset={5}
      >
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-sm pr-2">{title}</h4>
            {trigger === 'click' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {content}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default HelpTooltip;