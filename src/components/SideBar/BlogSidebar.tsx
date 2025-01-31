import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFile } from "@fortawesome/free-solid-svg-icons"

import FileList from "@/app/blogs/FileList.json"
import {
  ChangeFile
} from "@/store/states/MDState"
import { useDispatch } from "react-redux";

export function BlogSidebar() {
  const disPatch = useDispatch();

  return (
    <Sidebar className="dark: dark">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>选择Markdown文件</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {FileList.Files.map((file) => (
                <SidebarMenuItem key={file.name}>
                  <SidebarMenuButton asChild>
                    <div title={file.discription} onClick={() => {disPatch(ChangeFile(file.name))}}>
                      <FontAwesomeIcon icon={faFile} />
                      <span>{file.name}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
  