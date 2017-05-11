/* @flow */

import { getBlockMarkup } from './block';
import { isList, getListMarkup } from './list';

/**
* The function will generate BBCode markup for given draftjs editorContent.
*/
export default function draftToBBCode(
  editorContent: ContentState,
  hashtagConfig: Object,
  directional: boolean,
  customEntityTransform: Function
): string {
  const BBCode = [];
  if (editorContent) {
    const { blocks, entityMap } = editorContent;
    if (blocks && blocks.length > 0) {
      let listBlocks = [];
      blocks.forEach((block) => {
        if (isList(block.type)) {
          listBlocks.push(block);
        } else {
          if (listBlocks.length > 0) {
            const listBBCode = getListMarkup(listBlocks, entityMap, hashtagConfig, customEntityTransform);
            BBCode.push(listBBCode);
            listBlocks = [];
          }
          const blockBBCode = getBlockMarkup(
            block,
            entityMap,
            hashtagConfig,
            directional,
            customEntityTransform,
          );
          BBCode.push(blockBBCode);
        }
      });
      if (listBlocks.length > 0) {
        const listBBCode = getListMarkup(listBlocks, entityMap, hashtagConfig,directional, customEntityTransform);
        BBCode.push(listBBCode);
        listBlocks = [];
      }
    }
  }
  return BBCode.join('');
}
