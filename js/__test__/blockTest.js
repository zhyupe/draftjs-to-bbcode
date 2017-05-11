/* @flow */

import { assert } from 'chai';
import {
  getBlockTag,
  getStylesAtOffset,
  sameStyleAsPrevious,
  addInlineStyleMarkup,
  addStylePropertyMarkup,
} from '../block';

describe('getBlockTag test suite', () => {
  it('should return correct block tag when getBlockTag is called', () => {
    assert.equal(getBlockTag('header-one'), 'h1');
    assert.equal(getBlockTag('unordered-list-item'), 'list');
    assert.equal(getBlockTag('unstyled'), '');
  });
});

describe('getStylesAtOffset test suite', () => {
  it('should return correct styles at some offset', () => {
    const inlineStyles = {
      BOLD: [true, true],
      ITALIC: [false, false],
      UNDERLINE: [true, false],
      STRIKETHROUGH: [false, false],
      CODE: [true, false],
      SUBSCRIPT: [true, false],
      SUPERSCRIPT: [true, false],
      COLOR: ['rgb(97,189,109)', 'rgb(26,188,156)'],
      BGCOLOR: ['rgb(99,199,199)', 'rgb(28,189,176)'],
      FONTSIZE: [10, 20],
      FONTFAMILY: ['Arial', 'Georgia'],
    };
    let styles = getStylesAtOffset(inlineStyles, 0);
    assert.equal(styles.COLOR, 'rgb(97,189,109)');
    assert.equal(styles.BGCOLOR, 'rgb(99,199,199)');
    assert.equal(styles.FONTSIZE, 10);
    assert.equal(styles.FONTFAMILY, 'Arial');
    assert.equal(styles.ITALIC, undefined);
    assert.equal(styles.UNDERLINE, true);
    assert.equal(styles.SUBSCRIPT, true);
    assert.equal(styles.SUPERSCRIPT, true);
    assert.equal(styles.BOLD, true);
    styles = getStylesAtOffset(inlineStyles, 1);
    assert.equal(styles.COLOR, 'rgb(26,188,156)');
    assert.equal(styles.BGCOLOR, 'rgb(28,189,176)');
    assert.equal(styles.FONTSIZE, 20);
    assert.equal(styles.FONTFAMILY, 'Georgia');
    assert.equal(styles.ITALIC, undefined);
    assert.equal(styles.UNDERLINE, undefined);
    assert.equal(styles.SUBSCRIPT, undefined);
    assert.equal(styles.SUPERSCRIPT, undefined);
    assert.equal(styles.BOLD, true);
  });
});

describe('sameStyleAsPrevious test suite', () => {
  it('should return true ifstyles at offset is same as style at previous offset', () => {
    const inlineStyles = {
      BOLD: [true, true, false],
      ITALIC: [false, false, true],
      UNDERLINE: [true, true, false],
      COLOR: ['rgb(97,189,109)', 'rgb(26,188,156)', 'rgb(26,188,156)'],
      BGCOLOR: ['rgb(97,189,109)', 'rgb(26,188,156)', 'rgb(26,188,156)'],
      FONTSIZE: [10, 10, 20],
      FONTFAMILY: ['Arial', 'Arial', 'Georgia'],
      length: 3,
    };
    let sameStyled = sameStyleAsPrevious(inlineStyles, ['BOLD', 'ITALIC', 'UNDERLINE'], 1);
    assert.isTrue(sameStyled);
    sameStyled = sameStyleAsPrevious(inlineStyles, ['BOLD', 'ITALIC', 'COLOR', 'BGCOLOR'], 1);
    assert.isNotTrue(sameStyled);
  });
  it('should return false if offset is 0', () => {
    const inlineStyles = {
      BOLD: [true, true, false],
      ITALIC: [false, false, true],
      UNDERLINE: [true, true, false],
      COLOR: ['rgb(97,189,109)', 'rgb(26,188,156)', 'rgb(26,188,156)'],
      BGCOLOR: ['rgb(97,189,109)', 'rgb(26,188,156)', 'rgb(26,188,156)'],
      FONTSIZE: [10, 10, 20],
      FONTFAMILY: ['Arial', 'Arial', 'Georgia'],
    };
    const sameStyled = sameStyleAsPrevious(inlineStyles, ['BOLD', 'ITALIC', 'UNDERLINE'], 0);
    assert.isNotTrue(sameStyled);
  });
  it('should return false if offset exceeds length', () => {
    const inlineStyles = {
      BOLD: [true, true, false],
      ITALIC: [false, false, true],
      UNDERLINE: [true, true, false],
      STRIKETHROUGH: [true, true, false],
      CODE: [true, true, false],
      COLOR: ['rgb(97,189,109)', 'rgb(26,188,156)', 'rgb(26,188,156)'],
      FONTSIZE: [10, 10, 20],
      FONTFAMILY: ['Arial', 'Arial', 'Georgia'],
    };
    const sameStyled = sameStyleAsPrevious(inlineStyles,
      ['BOLD', 'ITALIC', 'UNDERLINE', 'STRIKETHROUGH', 'CODE'], 3);
    assert.isNotTrue(sameStyled);
  });
});

describe('addInlineStyleMarkup test suite', () => {
  let markup = addInlineStyleMarkup('BOLD', 'test');
  assert.equal(markup, '[b]test[/b]');
  markup = addInlineStyleMarkup('ITALIC', 'test');
  assert.equal(markup, '[i]test[/i]');
  markup = addInlineStyleMarkup('UNDERLINE', 'test');
  assert.equal(markup, '[u]test[/u]');
  markup = addInlineStyleMarkup('STRIKETHROUGH', 'test');
  assert.equal(markup, '[s]test[/s]');
  markup = addInlineStyleMarkup('CODE', 'test');
  assert.equal(markup, '[code]test[/code]');
});

describe('addStylePropertyMarkup test suite', () => {
  let markup = addStylePropertyMarkup(
    {
      COLOR: 'red',
      BGCOLOR: 'pink',
      FONTSIZE: 10,
      FONTFAMILY: 'Arial',
    },
    'test',
  );
  assert.equal(
    markup,
    '[color=red][bgcolor=pink][size=10][font=Arial]test[/font][/size][/bgcolor][/color]',
  );
  markup = addStylePropertyMarkup({ COLOR: 'red' }, 'test');
  assert.equal(markup, '[color=red]test[/color]');
  markup = addStylePropertyMarkup({ BGCOLOR: 'pink' }, 'test');
  assert.equal(markup, '[bgcolor=pink]test[/bgcolor]');
  markup = addStylePropertyMarkup({ FONTFAMILY: 'Arial' }, 'test');
  assert.equal(markup, '[font=Arial]test[/font]');
  markup = addStylePropertyMarkup({ BOLD: true }, 'test');
  assert.equal(markup, 'test');
  markup = addStylePropertyMarkup(undefined, 'test');
  assert.equal(markup, 'test');
});
