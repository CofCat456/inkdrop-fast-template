'use babel';

import yaml from 'js-yaml'
import { graceful } from 'detect-newline'

function detectNewline(string) {
  if (typeof string !== 'string') {
    throw new TypeError('Expected a string');
  }

  const newlines = string.match(/(?:\r?\n)/g) || [];

  if (newlines.length === 0) {
    return;
  }

  const crlf = newlines.filter(newline => newline === '\r\n').length;
  const lf = newlines.length - crlf;

  return crlf > lf ? '\r\n' : '\n';
}

function detectNewlineGraceful(string) {
  return (typeof string === 'string' && detectNewline(string)) || '\n';
}

function splitTextWithMetadata(text, end) {
  const metadataEndIndex = text.indexOf(end)

  return text.substring(metadataEndIndex + end.length)
}

export function markdownParserToObject(markdown) {
  const newline = graceful(markdown)
  const METADATA_END = `${newline}---${newline}`

  const charactersBetweenGroupedHyphens = /^---([\s\S]*?)---/;
  const metadataMatched = markdown.match(charactersBetweenGroupedHyphens);

  if (!metadataMatched) {
    return {
      metadata: {},
      content: markdown
    };
  }

  const metadata = metadataMatched[1];

  if (!metadata) {
    return {
      metadata: {},
      content: markdown
    };
  }

  const metadataLines = metadata.split("\n");
  const metadataObject = metadataLines.reduce((accumulator, line) => {
    const [key, ...value] = line.split(":").map((part) => part.trim());

    if (key)
      accumulator[key] = value[1] ? value.join(":") : value.join("");
    return accumulator;
  }, {});

  return {
    metadata: metadataObject,
    content: splitTextWithMetadata(markdown, METADATA_END)
  };
};

export function ObjectMetadataParserToMarkdown(metadata) {
  return Object.keys(metadata).length === 0 ? '' : `---\n${yaml.dump({
    ...metadata
  })}---\n\n`;
}
