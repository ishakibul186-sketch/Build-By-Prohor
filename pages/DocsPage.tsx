
import React, { useState, useEffect } from 'react';
import AnimatedPage from '../components/AnimatedPage';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// A simple component to parse and render basic Markdown
const SimpleMarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const renderLine = (line: string, index: number) => {
    if (line.startsWith('# ')) {
      return <h1 key={index} className="text-4xl font-bold text-primary mt-8 mb-4">{line.substring(2)}</h1>;
    }
    if (line.startsWith('## ')) {
      return <h2 key={index} className="text-3xl font-bold text-slate-100 mt-6 mb-3">{line.substring(3)}</h2>;
    }
    if (line.startsWith('### ')) {
      return <h3 key={index} className="text-2xl font-semibold text-slate-200 mt-4 mb-2">{line.substring(4)}</h3>;
    }
    if (line.startsWith('- ')) {
      // This handles list items. We'll group them visually with margins.
      return <li key={index} className="ml-8 text-slate-300">{line.substring(2)}</li>;
    }
    if (line.trim() === '') {
      return null; // Don't render empty lines as paragraphs
    }

    // Process inline elements like **bold** and `code` and [links](/url)
    const parts = line
      .split(/(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g)
      .map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={i} className="bg-slate-700 text-secondary px-1 py-0.5 rounded text-sm">{part.slice(1, -1)}</code>;
        }
        if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
            const linkTextMatch = part.match(/\[(.*?)\]/);
            const urlMatch = part.match(/\((.*?)\)/);
            if(linkTextMatch && urlMatch) {
                const linkText = linkTextMatch[1];
                const url = urlMatch[1];
                // Use Link for internal paths, <a> for external
                if (url.startsWith('/')) {
                    return <Link key={i} to={url} className="text-primary hover:underline">{linkText}</Link>;
                }
                return <a key={i} href={url} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">{linkText}</a>;
            }
        }
        return part;
      });

    return <p key={index} className="text-slate-300 leading-relaxed my-2">{parts}</p>;
  };

  // Group consecutive list items
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  lines.forEach((line, index) => {
    if (line.startsWith('- ')) {
      listItems.push(line);
    } else {
      if (listItems.length > 0) {
        elements.push(<ul key={`ul-${index}`} className="list-disc space-y-2 my-4">{listItems.map(renderLine)}</ul>);
        listItems = [];
      }
      elements.push(renderLine(line, index));
    }
  });

  // Add any remaining list items at the end
  if (listItems.length > 0) {
    elements.push(<ul key="ul-end" className="list-disc space-y-2 my-4">{listItems.map(renderLine)}</ul>);
  }

  return <>{elements}</>;
};


const DocsPage: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const response = await fetch('./docs/index.md');
        if (!response.ok) {
          throw new Error('Failed to fetch documentation.');
        }
        const text = await response.text();
        setMarkdown(text);
      } catch (err) {
        setError('Could not load documentation. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, []);

  return (
    <AnimatedPage>
      <div className="bg-slate-900 text-white min-h-[calc(100vh-64px)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          )}
          {error && <p className="text-center text-red-500">{error}</p>}
          {!loading && !error && (
            <motion.article
              className="prose prose-invert lg:prose-xl bg-slate-800 p-8 rounded-lg border border-slate-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
             <SimpleMarkdownRenderer content={markdown} />
            </motion.article>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
};

export default DocsPage;
