"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"


const BlogRollLinks = [
  {
    name: "my github acc",
    url: "https://nemocccc.github.io/",
  },
 {
    name: "sunwuzhou03",
    url: "https://sunwuzhou03.github.io/",
  },
  {
    name: "1",
    url: "https://sunwuzhou03.github.io/",
  },
  {
    name: "2",
    url: "https://sunwuzhou03.github.io/",
  }
]

function DisLinks() {
  return BlogRollLinks.map((link) => (
    <React.Fragment key={link.name}>
      <div className="justify-items-center rounded-lg p-2
      hover:shadow-slate-300 hover:shadow-md hover:text-lg hover:bg-gradient-to-r hover:from-red-300 hover:to-pink-300">
        <a  href={link.url}>
          <h2>{link.name}</h2>
          <div className="text-xs" >{link.url}</div>
        </a>
      </div>
      <Separator className="my-2" />
    </React.Fragment>
  ));
}

function ScrollAreaDemo() {
  return (
    <ScrollArea className="h-72 w-108 rounded-md border">
      <div className="p-4">
        {DisLinks()}
      </div>
    </ScrollArea>
  )
}


export default function DrawerDemo() {

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" className="absolute bottom-5 right-5 bg-transparent border-none text-lg
         hover:bg-transparent hover:text-white hover:font-bold">
          友情链接
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>友情链接</DrawerTitle>
            <DrawerDescription>自己跟自己算不算友情？</DrawerDescription>
          </DrawerHeader>
          <ScrollAreaDemo />
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">收起</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
