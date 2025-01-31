import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'   // markdown 对表格/删除线/脚注等的支持
import 'markdown-navbar/dist/navbar.css'
import remarkToc from 'remark-toc'
import { useSelector } from 'react-redux'
import FileList from './FileList.json'
import 'github-markdown-css/github-markdown.css'



export default function Blogs() {
    const FileName = useSelector((state: {MDDis: {value: string}}) => state.MDDis.value)
    const [markdownContent, setMarkdownContent] = useState('');


    useEffect(() => {
        fetch(`/typora/${FileList.default.name}.md`) // 以public为/目录，因为打包之后public目录就没有了
        .then(response => response.text())
        .then(text => setMarkdownContent(text))
    }, [])
    

    useEffect(() => {
        const handleSelectFile = async () => {
            try {
              // 动态导入Markdown文件
              console.log(FileName);
              fetch(`/typora/${FileName}.md`) // 以public为/目录，因为打包之后public目录就没有了
                .then(response => response.text())
                .then(text => setMarkdownContent(text))
            } catch (error) {
              console.error('加载Markdown文件失败:', error);
              setMarkdownContent('加载失败，请重试。');
            }
        };

        if (FileName) { 
          handleSelectFile();
        }
    }, [FileName]);




    return (
        <div className="flex relative">
            <div className="markdown-body content p-4 w-70%">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkToc]}>
                    {markdownContent}
                </ReactMarkdown>
            </div>
        </div>
    )
}