import React from 'react';

// Fungsi untuk memformat response markdown dari chatbot
export const formatMessage = (content: string): React.ReactElement[] => {
  // Split content menjadi lines untuk memproses list
  const lines = content.split('\n');
  const formattedLines: React.ReactElement[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Handle bullet points yang dimulai dengan * (dengan atau tanpa spasi)
    if (line.match(/^\s*\*\s+/)) {
      line = line.replace(/^\s*\*\s+/, '• ');
      formattedLines.push(
        React.createElement(
          'div',
          { key: i, className: "ml-4 mb-1" },
          formatInlineText(line)
        )
      );
    }
    // Handle numbered lists (opsional)
    else if (line.match(/^\s*\d+\.\s+/)) {
      formattedLines.push(
        React.createElement(
          'div',
          { key: i, className: "ml-4 mb-1" },
          formatInlineText(line)
        )
      );
    }
    // Handle empty lines
    else if (line.trim() === '') {
      formattedLines.push(React.createElement('br', { key: i }));
    }
    // Handle regular paragraphs
    else {
      formattedLines.push(
        React.createElement(
          'div',
          { key: i, className: "mb-2" },
          formatInlineText(line)
        )
      );
    }
  }
  
  return formattedLines;
};

// Fungsi untuk memformat teks inline (bold, italic)
export const formatInlineText = (text: string): (string | React.ReactElement)[] => {
  const parts: (string | React.ReactElement)[] = [];
  let currentIndex = 0;
  
  // Regex untuk menangkap **bold** dan *italic*
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    // Tambahkan teks sebelum match
    if (match.index > currentIndex) {
      parts.push(text.substring(currentIndex, match.index));
    }
    
    const matchedText = match[0];
    
    // Check if it's bold (**text**)
    if (matchedText.startsWith('**') && matchedText.endsWith('**')) {
      const boldText = matchedText.slice(2, -2);
      parts.push(
        React.createElement(
          'strong',
          { key: match.index, className: "font-semibold text-gray-900" },
          boldText
        )
      );
    }
    // Check if it's italic (*text*)
    else if (matchedText.startsWith('*') && matchedText.endsWith('*')) {
      const italicText = matchedText.slice(1, -1);
      parts.push(
        React.createElement(
          'em',
          { key: match.index, className: "italic text-gray-800" },
          italicText
        )
      );
    }
    
    currentIndex = regex.lastIndex;
  }
  
  // Tambahkan sisa teks
  if (currentIndex < text.length) {
    parts.push(text.substring(currentIndex));
  }
  
  return parts.length > 0 ? parts : [text];
};