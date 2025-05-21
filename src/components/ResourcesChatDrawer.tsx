
import React from 'react';
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { MessageCircle } from 'lucide-react';
import ChatBot from './ChatBot';

const ResourcesChatDrawer: React.FC = () => {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[80vh]">
        <ChatBot />
      </DrawerContent>
    </Drawer>
  );
};

export default ResourcesChatDrawer;
