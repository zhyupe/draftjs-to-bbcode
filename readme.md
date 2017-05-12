# DraftJS TO BBCode

A library for converting DraftJS Editor content to BBCode.

This is draft to BBCode library, migrated from [jpuri/draftjs-to-html](https://github.com/jpuri/draftjs-to-html), for the new TJUBBS(https://bbs.tju.edu.cn) (Currently under development).

Please notice that this library is developed specially for our own project. It doesn't strictly follow the official bbcode syntax. So there is no guarantee that the code it generates can be parsed by a random parser.

## Installing

`npm install draftjs-to-bbcode`

## Using

```
import draftToBBCode from 'draftjs-to-bbcode';

const rawContentState = convertToRaw(editorState.getCurrentContent());
const markup = draftToBBCode(contentState, hashtagConfig, directional, customEntityTransform);
```
The function parameters are:

1. **contentState**: Its instance of  [RawDraftContentState](https://facebook.github.io/draft-js/docs/api-reference-data-conversion.html#content)

2. **hashConfig**: Its configuration object for hashtag, its required only if hashtags are used. If the object is not defined hashtags will be output as simple text in the markdown.
    ```
    hashConfig = {
      trigger: '#',
      separator: ' ',
    }
    ```
    Here trigger is character that marks starting of hashtag (default '#') and separator is character that separates characters (default ' ').

3. **directional**: Boolean, if directional is true text is aligned according to bidi algorithm.

4. **customEntityTransform**: Its function to render custom defined entities by user, its also optional.

## Supported conversions
Following is the list of conversions it supports:

1. Convert block types to corresponding BBCode tags:

  || Block Type | BBCode Tag |
  | -------- | -------- | -------- |
  | 1 | header-one | h1 |
  | 2 | header-two | h2 |
  | 3 | header-three | h3 |
  | 4 | header-four | h4 |
  | 5 | header-five | h5 |
  | 6 | header-six | h6 |
  | 7 | unordered-list-item | list |
  | 8 | ordered-list-item | list=1 |
  | 9 | blockquote | quote |
  | 10 | unstyled | *None* |

  It performs these additional changes to text of blocks:
    - replace blank space in beginning and end of block with `&nbsp;`
    - replace `[` with `&lt;`
    - replace `]` with `&gt;`

2. Converts ordered and unordered list blocks with depths to nested structure of `[list]` and `[*]`.

3. Converts inline styles BOLD, ITALIC, UNDERLINE, STRIKETHROUGH, CODE, SUPERSCRIPT, SUBSCRIPT to corresponding BBCode tags: `[b], [i], [u], [s], [code], [sup], [sub]`.

4. Converts inline styles color, background-color, font-size, font-family to a span tag with inline style details:
`[color=xyz][/color]`, `[size=xx][/size]`. The inline styles should start with strings `color` or `fontsize` like `color-red`, `color-green` or `fontsize-12`, `fontsize-20`.

5. Converts entity range of type link to anchor tag using entity data url for href: `[url=url]text[/url]` or `[url]url[/url]`.

6. Converts atomic entity image to image tag using entity data src for image source: `[img]src[/img]`.

7. `customEntityTransform` can be used for transformation of a custom entity block to html.

8. Adding style property to block tag for block level styles like text-align: `[align=right]text[/align]`.

## License
MIT.
