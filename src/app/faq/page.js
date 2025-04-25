// src/app/faq/page.js
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion";
  import { Separator } from "@/components/ui/separator";
  
  export default function FAQPage() {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-center">Frequently Asked Questions</h1>
            <p className="mt-4 text-center text-gray-600">
              Find answers to the most common questions about our services.
            </p>
          </div>
          
          <Separator className="my-6" />
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How do I create an account?</AccordionTrigger>
              <AccordionContent>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse 
                malesuada lacus ex, sit amet blandit leo lobortis eget. Vestibulum 
                mollis mauris enim. Morbi euismod, felis vitae tincidunt sollicitudin, 
                mi ligula venenatis urna, et pharetra tellus ex ac lorem.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
              <AccordionContent>
                Nullam quis risus eget urna mollis ornare vel eu leo. Cras mattis 
                consectetur purus sit amet fermentum. Donec id elit non mi porta 
                gravida at eget metus. Aenean lacinia bibendum nulla sed consectetur. 
                Curabitur blandit tempus porttitor.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger>How can I reset my password?</AccordionTrigger>
              <AccordionContent>
                Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum 
                nibh, ut fermentum massa justo sit amet risus. Praesent commodo 
                cursus magna, vel scelerisque nisl consectetur et. Donec sed odio 
                dui. Cras mattis consectetur purus sit amet fermentum.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger>Is my data secure?</AccordionTrigger>
              <AccordionContent>
                Cras mattis consectetur purus sit amet fermentum. Nullam quis risus 
                eget urna mollis ornare vel eu leo. Integer posuere erat a ante 
                venenatis dapibus posuere velit aliquet. Donec sed odio dui. Aenean 
                eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5">
              <AccordionTrigger>Can I cancel my subscription?</AccordionTrigger>
              <AccordionContent>
                Integer posuere erat a ante venenatis dapibus posuere velit aliquet. 
                Maecenas faucibus mollis interdum. Donec sed odio dui. Cras mattis 
                consectetur purus sit amet fermentum. Curabitur blandit tempus 
                porttitor. Nullam quis risus eget urna mollis ornare vel eu leo.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-6">
              <AccordionTrigger>How do I contact customer support?</AccordionTrigger>
              <AccordionContent>
                Maecenas sed diam eget risus varius blandit sit amet non magna. 
                Cras justo odio, dapibus ac facilisis in, egestas eget quam. 
                Donec ullamcorper nulla non metus auctor fringilla. Duis mollis, 
                est non commodo luctus, nisi erat porttitor ligula, eget lacinia 
                odio sem nec elit.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    );
  }