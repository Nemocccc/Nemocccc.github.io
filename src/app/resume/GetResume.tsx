// filepath: /d:/nemocccc.github.io/src/app/resume/Resume.tsx
import React from 'react';


export default function Resume() {
    const pdfUrl = '/resume/resume.pdf'; // PDF 文件的路径

    return (
        <div style={{ width: '100%', height: '100vh' }}>
        <iframe
            src={pdfUrl}
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            title="PDF Viewer"
        />
        </div>
    );
}