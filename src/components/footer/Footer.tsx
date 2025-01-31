import Frame from "./frame/frame"
import Blogroll from "./blogroll/blogroll"
 
export default function Footer() {
  return (
    <div className="flex flex-row justify-between relative">
        <Frame />
        <Blogroll />
    </div>
  )
}