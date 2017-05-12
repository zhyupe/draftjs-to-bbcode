import { forEach, isEmptyString } from './common';

/**
* Mapping block-type to corresponding BBCode tag.
*/
const blockTypesMapping: Object = {
  unstyled: '',
  'header-one': 'h1',
  'header-two': 'h2',
  'header-three': 'h3',
  'header-four': 'h4',
  'header-five': 'h5',
  'header-six': 'h6',
  'unordered-list-item': 'list',
  'ordered-list-item': 'list',
  blockquote: 'quote',
};

/**
* Function will return BBCode tag for a block.
*/
export function getBlockTag(type: string): string {
  return type && blockTypesMapping[type];
}

/**
* Function will return style string for a block.
*/
export function getBlockStyle(data: Object): string {
  let blockStyleStart = '';
  let blockStyleEnd = '';
  forEach(data, (key, value) => {
    if (value) {
      switch (key) {
        case 'text-align':
          blockStyleStart += `[align=${value}]`;
          blockStyleEnd = `[/align]${blockStyleEnd}`;
          break;
        default:
          break;
      }
    }
  });
  return { blockStyleStart, blockStyleEnd };
}

/**
* The function returns an array of hashtag-sections in blocks.
* These will be areas in block which have hashtags applicable to them.
*/
function getHashtagRanges(blockText: string, hashtagConfig: Object): Array<Object> {
  const sections = [];
  if (hashtagConfig) {
    let counter = 0;
    let startIndex = 0;
    let text = blockText;
    const trigger = hashtagConfig.trigger || '#';
    const separator = hashtagConfig.separator || ' ';
    for (;text.length > 0 && startIndex >= 0;) {
      if (text[0] === trigger) {
        startIndex = 0;
        counter = 0;
        text = text.substr(trigger.length);
      } else {
        startIndex = text.indexOf(separator + trigger);
        if (startIndex >= 0) {
          text = text.substr(startIndex + (separator + trigger).length);
          counter += startIndex + separator.length;
        }
      }
      if (startIndex >= 0) {
        const endIndex =
          text.indexOf(separator) >= 0
          ? text.indexOf(separator)
          : text.length;
        const hashtag = text.substr(0, endIndex);
        if (hashtag && hashtag.length > 0) {
          sections.push({
            offset: counter,
            length: hashtag.length + trigger.length,
            type: 'HASHTAG',
          });
        }
        counter += trigger.length;
      }
    }
  }
  return sections;
}

/**
* The function returns an array of entity-sections in blocks.
* These will be areas in block which have same entity or no entity applicable to them.
*/
function getSections(
  block: Object,
  hashtagConfig: Object,
): Array<Object> {
  const sections = [];
  let lastOffset = 0;
  let sectionRanges = block.entityRanges.map((range) => {
    const { offset, length, key } = range;
    return {
      offset,
      length,
      key,
      type: 'ENTITY',
    };
  });
  sectionRanges = sectionRanges.concat(getHashtagRanges(block.text, hashtagConfig));
  sectionRanges = sectionRanges.sort((s1, s2) => s1.offset - s2.offset);
  sectionRanges.forEach((r) => {
    if (r.offset > lastOffset) {
      sections.push({
        start: lastOffset,
        end: r.offset,
      });
    }
    sections.push({
      start: r.offset,
      end: r.offset + r.length,
      entityKey: r.key,
      type: r.type,
    });
    lastOffset = r.offset + r.length;
  });
  if (lastOffset < block.text.length) {
    sections.push({
      start: lastOffset,
      end: block.text.length,
    });
  }
  return sections;
}

/**
* Function to check if the block is an atomic entity block.
*/
function isAtomicEntityBlock(block: Object): boolean {
  if ((block.entityRanges.length > 0 && isEmptyString(block.text)) ||
    block.type === 'atomic') {
    return true;
  }
  return false;
}

/**
* The function will return array of inline styles applicable to the block.
*/
function getStyleArrayForBlock(block: Object): Object {
  const { text, inlineStyleRanges } = block;
  const inlineStyles = {
    BOLD: new Array(text.length),
    ITALIC: new Array(text.length),
    UNDERLINE: new Array(text.length),
    STRIKETHROUGH: new Array(text.length),
    CODE: new Array(text.length),
    SUPERSCRIPT: new Array(text.length),
    SUBSCRIPT: new Array(text.length),
    COLOR: new Array(text.length),
    BGCOLOR: new Array(text.length),
    FONTSIZE: new Array(text.length),
    FONTFAMILY: new Array(text.length),
    length: text.length,
  };
  if (inlineStyleRanges && inlineStyleRanges.length > 0) {
    inlineStyleRanges.forEach((range) => {
      const offset = range.offset;
      const length = offset + range.length;
      for (let i = offset; i < length; i += 1) {
        if (range.style.indexOf('color-') === 0) {
          inlineStyles.COLOR[i] = range.style.substring(6);
        } else if (range.style.indexOf('bgcolor-') === 0) {
          inlineStyles.BGCOLOR[i] = range.style.substring(8);
        } else if (range.style.indexOf('fontsize-') === 0) {
          inlineStyles.FONTSIZE[i] = range.style.substring(9);
        } else if (range.style.indexOf('fontfamily-') === 0) {
          inlineStyles.FONTFAMILY[i] = range.style.substring(11);
        } else if (inlineStyles[range.style]) {
          inlineStyles[range.style][i] = true;
        }
      }
    });
  }
  return inlineStyles;
}

/**
* The function will return inline style applicable at some offset within a block.
*/
export function getStylesAtOffset(inlineStyles: Object, offset: number): Object {
  const styles = {};
  if (inlineStyles.COLOR[offset]) {
    styles.COLOR = inlineStyles.COLOR[offset];
  }
  if (inlineStyles.BGCOLOR[offset]) {
    styles.BGCOLOR = inlineStyles.BGCOLOR[offset];
  }
  if (inlineStyles.FONTSIZE[offset]) {
    styles.FONTSIZE = inlineStyles.FONTSIZE[offset];
  }
  if (inlineStyles.FONTFAMILY[offset]) {
    styles.FONTFAMILY = inlineStyles.FONTFAMILY[offset];
  }
  if (inlineStyles.UNDERLINE[offset]) {
    styles.UNDERLINE = true;
  }
  if (inlineStyles.ITALIC[offset]) {
    styles.ITALIC = true;
  }
  if (inlineStyles.BOLD[offset]) {
    styles.BOLD = true;
  }
  if (inlineStyles.STRIKETHROUGH[offset]) {
    styles.STRIKETHROUGH = true;
  }
  if (inlineStyles.CODE[offset]) {
    styles.CODE = true;
  }
  if (inlineStyles.SUBSCRIPT[offset]) {
    styles.SUBSCRIPT = true;
  }
  if (inlineStyles.SUPERSCRIPT[offset]) {
    styles.SUPERSCRIPT = true;
  }
  return styles;
}

/**
* Function returns true for a set of styles if the value of these styles at an offset
* are same as that on the previous offset.
*/
export function sameStyleAsPrevious(
  inlineStyles: Object,
  styles: Array<string>,
  index: number,
): boolean {
  let sameStyled = true;
  if (index > 0 && index < inlineStyles.length) {
    styles.forEach((style) => {
      sameStyled = sameStyled && inlineStyles[style][index] === inlineStyles[style][index - 1];
    });
  } else {
    sameStyled = false;
  }
  return sameStyled;
}

/**
* Function returns BBCode for text depending on inline style tags applicable to it.
*/
export function applyInlineStyleMarkup(style: string, content: Object): string {
  if (style === 'BOLD') {
    content.tag.add('b');
  } else if (style === 'ITALIC') {
    content.tag.add('i');
  } else if (style === 'UNDERLINE') {
    content.tag.add('u');
  } else if (style === 'STRIKETHROUGH') {
    content.tag.add('s');
  } else if (style === 'CODE') {
    content.tag.add('code');
  } else if (style === 'SUPERSCRIPT') {
    content.tag.add('sup');
  } else if (style === 'SUBSCRIPT') {
    content.tag.add('sub');
  }
  return content;
}

/**
* The function returns text for given section of block after doing required character replacements.
*/
function getSectionText(text: Array<string>): string {
  if (text && text.length > 0) {
    const chars = text.map((ch) => {
      switch (ch) {
        case '[':
          return '&#91;';
        case ']':
          return '&#93;';
        default:
          return ch;
      }
    });
    return chars.join('');
  }
  return '';
}

/**
* Function returns BBCode for text depending on inline style tags applicable to it.
*/
export function addStylePropertyMarkup(styles: Object, text: string): string {
  if (styles && (styles.COLOR || styles.BGCOLOR || styles.FONTSIZE || styles.FONTFAMILY)) {
    let startString = '';
    let endString = '';
    if (styles.COLOR) {
      startString += `[color=${styles.COLOR}]`;
      endString = `[/color]${endString}`;
    }
    if (styles.BGCOLOR) {
      startString += `[bgcolor=${styles.BGCOLOR}]`;
      endString = `[/bgcolor]${endString}`;
    }
    if (styles.FONTSIZE) {
      startString += `[size=${styles.FONTSIZE}]`;
      endString = `[/size]${endString}`;
    }
    if (styles.FONTFAMILY) {
      startString += `[font=${styles.FONTFAMILY}]`;
      endString = `[/font]${endString}`;
    }
    return `${startString}${text}${endString}`;
  }
  return text;
}

/**
* Function will return markup for Entity.
*/
function getEntityMarkup(
  entityMap: Object,
  entityKey: number,
  text: string,
  customEntityTransform: Function,
): string {
  const entity = entityMap[entityKey];
  if (typeof customEntityTransform === 'function') {
    const BBCode = customEntityTransform(entity, text);
    if (BBCode) {
      return BBCode;
    }
  }
  // if (entity.type === 'MENTION') {
  //   return `<a href="${entity.data.url}" class="wysiwyg-mention" data-mention data-value="${entity.data.value}">${text}</a>`;
  // }
  if (entity.type === 'LINK') {
    if (entity.data.url === text) {
      return `[url]${entity.data.url}[/url]`;
    }
    return `[url=${entity.data.url}]${text}[/url]`;
  }
  if (entity.type === 'IMAGE') {
    let arg = '';
    if (entity.data.height || entity.data.width) {
      arg = `=${entity.data.width || 'auto'},${entity.data.height || 'auto'}`;
    }
    if (entity.data.alignment) {
      return `[float=${entity.data.alignment}][img${arg}]${entity.data.src}[/img][/float]`;
    }
    return `[img${arg}]${entity.data.src}[/img]`;
  }
  // if (entity.type === 'EMBEDDED_LINK') {
  //   return `<iframe width="${entity.data.width}" height="${entity.data.height}" src="${entity.data.src}" frameBorder="0"></iframe>`;
  // }
  return text;
}

/**
* For a given section in a block the function will return a further list of sections,
* with similar inline styles applicable to them.
*/
function getInlineStyleSections(
  block: Object,
  styles: Array<string>,
  start: number,
  end: number,
): Array<Object> {
  const styleSections = [];
  const { text } = block;
  if (text.length > 0) {
    const inlineStyles = getStyleArrayForBlock(block);
    let section;
    for (let i = start; i < end; i += 1) {
      if (i !== start && sameStyleAsPrevious(inlineStyles, styles, i)) {
        section.text.push(text[i]);
        section.end = i + 1;
      } else {
        section = {
          styles: getStylesAtOffset(inlineStyles, i),
          text: [text[i]],
          start: i,
          end: i + 1,
        };
        styleSections.push(section);
      }
    }
  }
  return styleSections;
}

/**
* The method returns markup for section to which inline styles
* like BOLD, ITALIC, UNDERLINE, STRIKETHROUGH, CODE, SUPERSCRIPT, SUBSCRIPT are applicable.
*/
function getStyleTagSectionTree(styleSection: Object): Object {
  const { styles, text } = styleSection;
  let content = {
    text: getSectionText(text),
    tag: new Set(),
  };

  forEach(styles, (style, value) => {
    content = applyInlineStyleMarkup(style, content, value);
  });
  return content;
}

function getStyleTagSectionMarkup(styleSections: Array<Object>): string {
  function insertToTree(tree) {
    let collector = [];
    const map = {};
    const end = tree.start + tree.length;

    function checkUniqueTag(tagKey) {
      let node = tree;
      while (node) {
        if (tagKey === node.name) return false;

        node = node.parent;
      }
      return true;
    }

    function commitMap(tagKeys) {
      tagKeys.forEach((tagKey) => {
        if (checkUniqueTag(tagKey)) {
          map[tagKey].name = tagKey;
          map[tagKey].end = map[tagKey].start + map[tagKey].length;
          collector.push(map[tagKey]);
        }
        delete map[tagKey];
      });
    }

    styleSections.forEach((section, i) => {
      if (i < tree.start || i >= end) return;
      const mapTags = new Set(Object.keys(map));
      section.tag.forEach((tag) => {
        mapTags.delete(tag);

        if (map[tag]) {
          map[tag].length += 1;
        } else {
          map[tag] = { start: i, length: 1 };
        }
      });

      commitMap(mapTags);
    });

    commitMap(Object.keys(map));

    collector.sort((a, b) => {
      if (a.length === b.length) {
        return b.start - a.start;
      }

      return a.length - b.length;
    });

    let count = 0;
    while (collector.length && count < tree.length) {
      const tag = collector.pop();

      count += tag.length;
      tree.child.push(tag);
      tag.parent = tree;
      tag.child = [];

      const newCollector = [];
      collector.forEach((otherTag) => {
        /* eslint no-param-reassign: 0 */
        if (otherTag.start >= tag.start && otherTag.start < tag.end) {
          otherTag.start = tag.end;
        }
        if (otherTag.end > tag.start && otherTag.end <= tag.end) {
          otherTag.end = tag.start;
        }

        otherTag.length = otherTag.end - otherTag.start;

        if (otherTag.length > 0) {
          newCollector.push(otherTag);
        }
      });

      collector = newCollector;
      insertToTree(tag);
    }

    tree.child.sort((a, b) => a.start - b.start);
  }

  const root = {
    start: 0,
    length: styleSections.length,
    end: styleSections.length,
    parent: null,
    child: [],
  };

  insertToTree(root);

  let index = 0;
  const render = (acc, cur) => {
    while (index < cur.start) {
      acc += styleSections[index].text;
      index += 1;
    }

    let content;
    if (cur.child.length) {
      content = cur.child.reduce(render, '');
    } else {
      content = styleSections[index].text;
      index += 1;
    }

    if (cur.name) {
      return `${acc}[${cur.name}]${content}[/${cur.name}]`;
    }

    return acc + content;
  };

  let result = render('', root);
  while (index < styleSections.length) {
    result += styleSections[index].text;
    index += 1;
  }

  return result;
}


/**
* The method returns markup for section to which inline styles
like color, background-color, font-size are applicable.
*/
function getInlineStyleSectionMarkup(block: Object, styleSection: Object): string {
  const styleTagSections = getInlineStyleSections(
    block, ['BOLD', 'ITALIC', 'UNDERLINE', 'STRIKETHROUGH', 'CODE', 'SUPERSCRIPT', 'SUBSCRIPT'], styleSection.start, styleSection.end,
  );
  const styleSections = styleTagSections.map(stylePropertySection => getStyleTagSectionTree(stylePropertySection));

  let styleSectionText = getStyleTagSectionMarkup(styleSections);
  styleSectionText = addStylePropertyMarkup(styleSection.styles, styleSectionText);
  return styleSectionText;
}

/*
* The method returns markup for an entity section.
* An entity section is a continuous section in a block
* to which same entity or no entity is applicable.
*/
function getSectionMarkup(
  block: Object,
  entityMap: Object,
  section: Object,
  customEntityTransform: Function,
  ): string {
  const entityInlineMarkup = [];
  const inlineStyleSections = getInlineStyleSections(
    block,
    ['COLOR', 'BGCOLOR', 'FONTSIZE', 'FONTFAMILY'],
    section.start,
    section.end,
  );
  inlineStyleSections.forEach((styleSection) => {
    entityInlineMarkup.push(getInlineStyleSectionMarkup(block, styleSection));
  });
  let sectionText = entityInlineMarkup.join('');
  if (section.type === 'ENTITY') {
    if (section.entityKey !== undefined && section.entityKey !== null) {
      sectionText = getEntityMarkup(entityMap, section.entityKey, sectionText, customEntityTransform);
    }
  } else if (section.type === 'HASHTAG') {
    sectionText = `[tag]${sectionText}[/tag]`;
  }
  return sectionText;
}

/**
* Function will return the markup for block preserving the inline styles and
* special characters like newlines or blank spaces.
*/
export function getBlockInnerMarkup(
  block: Object,
  entityMap: Object,
  hashtagConfig: Object,
  customEntityTransform: Function,
): string {
  const blockMarkup = [];
  const sections = getSections(block, hashtagConfig);
  sections.forEach((section, index) => {
    const sectionText =
      getSectionMarkup(block, entityMap, section, customEntityTransform);
    blockMarkup.push(sectionText);
  });
  return blockMarkup.join('');
}

/**
* Function will return BBCode for the block.
*/
export function getBlockMarkup(
  block: Object,
  entityMap: Object,
  hashtagConfig: Object,
  directional: boolean,
  customEntityTransform: Function,
): string {
  const blockBBCode = [];
  if (isAtomicEntityBlock(block)) {
    blockBBCode.push(
      getEntityMarkup(
        entityMap,
        block.entityRanges[0].key,
        undefined,
        customEntityTransform,
      ));
  } else {
    const blockTag = getBlockTag(block.type);
    if (blockTag) {
      blockBBCode.push(`[${blockTag}]`);
    }

    const { blockStyleStart, blockStyleEnd } = getBlockStyle(block.data);
    if (blockStyleStart) {
      blockBBCode.push(blockStyleStart);
    }
    // if (directional) {
    //   blockBBCode.push(' dir = "auto"');
    // }
    blockBBCode.push(getBlockInnerMarkup(block, entityMap, hashtagConfig, customEntityTransform));

    if (blockStyleEnd) {
      blockBBCode.push(blockStyleEnd);
    }

    if (blockTag) {
      blockBBCode.push(`[/${blockTag}]`);
    }
  }
  blockBBCode.push('\n');
  return blockBBCode.join('');
}
