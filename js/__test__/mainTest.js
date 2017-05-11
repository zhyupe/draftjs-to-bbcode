import { assert } from 'chai';
import { convertFromHTML, ContentState, convertToRaw } from 'draft-js';
import draftToBBCode from '../index';

describe('draftToBBCode test suite', () => {
  it('should return correct html', () => {
    const html = '<p>testing</p>\n';
    const arrContentBlocks = convertFromHTML(html);
    const contentState = ContentState.createFromBlockArray(arrContentBlocks);
    const result = draftToBBCode(convertToRaw(contentState));
    assert.equal(html, result);
  });

  it('should return empty string for undefined input', () => {
    const result = draftToBBCode(undefined);
    assert.equal('', result);
  });

  it('should return correct result for list', () => {
    let html = '<ul><li>1</li>\n<li>2</li>\n<li>3</li>\n</ul>\n';
    let output = '[list]\n[*]1\n[*]2\n[*]3\n[/list]\n';
    let arrContentBlocks = convertFromHTML(html);
    let contentState = ContentState.createFromBlockArray(arrContentBlocks);
    let result = draftToBBCode(convertToRaw(contentState));
    assert.equal(output, result);

    html = '<ol><li>1</li>\n<li>2</li>\n<li>3</li>\n</ol>\n';
    output = '[list=1]\n[*]1\n[*]2\n[*]3\n[/list]\n';
    arrContentBlocks = convertFromHTML(html);
    contentState = ContentState.createFromBlockArray(arrContentBlocks);
    result = draftToBBCode(convertToRaw(contentState));
    assert.equal(output, result);

    html = '<ol><li>1</li>\n<ol><li>2</li>\n</ol>\n<li>3</li>\n</ol>\n';
    output = '[list=1]\n[*]1\n[list=1]\n[*]2\n[/list]\n[*]3\n[/list]\n';
    arrContentBlocks = convertFromHTML(html);
    contentState = ContentState.createFromBlockArray(arrContentBlocks);
    result = draftToBBCode(convertToRaw(contentState));
    assert.equal(output, result);

    html = '<ol><li>1</li>\n<ol><li>2</li>\n<li>3</li>\n</ol>\n<li>4</li>\n</ol>\n';
    output = '[list=1]\n[*]1\n[list=1]\n[*]2\n[*]3\n[/list]\n[*]4\n[/list]\n';
    arrContentBlocks = convertFromHTML(html);
    contentState = ContentState.createFromBlockArray(arrContentBlocks);
    result = draftToBBCode(convertToRaw(contentState));
    assert.equal(output, result);

    html = '<ol><li>1</li>\n<ol><li>2</li>\n<ol><li>3</li>\n</ol>\n</ol>\n<li>3</li>\n</ol>\n';
    output = '[list=1]\n[*]1\n[list=1]\n[*]2\n[list=1]\n[*]3\n[/list]\n[/list]\n[*]3\n[/list]\n';
    arrContentBlocks = convertFromHTML(html);
    contentState = ContentState.createFromBlockArray(arrContentBlocks);
    result = draftToBBCode(convertToRaw(contentState));
    assert.equal(output, result);
  });

  it('should return correct result for inline styles color', () => {
    let html = '<ul><li>1</li>\n<li>2</li>\n<li>3</li>\n</ul>\n';
    let output = '[list]\n[*]1\n[*]2\n[*]3\n[/list]\n';
    let arrContentBlocks = convertFromHTML(html);
    let contentState = ContentState.createFromBlockArray(arrContentBlocks);
    let result = draftToBBCode(convertToRaw(contentState));
    assert.equal(output, result);

    html = '<ol><li>1</li>\n<li>2</li>\n<li>3</li>\n</ol>\n';
    output = '[list=1]\n[*]1\n[*]2\n[*]3\n[/list]\n';
    arrContentBlocks = convertFromHTML(html);
    contentState = ContentState.createFromBlockArray(arrContentBlocks);
    result = draftToBBCode(convertToRaw(contentState));
    assert.equal(output, result);

    html = '<ol><li>1</li>\n<ol><li>2</li>\n</ol>\n<li>3</li>\n</ol>\n';
    output = '[list=1]\n[*]1\n[list=1]\n[*]2\n[/list]\n[*]3\n[/list]\n';
    arrContentBlocks = convertFromHTML(html);
    contentState = ContentState.createFromBlockArray(arrContentBlocks);
    result = draftToBBCode(convertToRaw(contentState));
    assert.equal(output, result);

    html = '<ol><li>1</li>\n<ol><li>2</li>\n<li>3</li>\n</ol>\n<li>4</li>\n</ol>\n';
    output = '[list=1]\n[*]1\n[list=1]\n[*]2\n[*]3\n[/list]\n[*]4\n[/list]\n';
    arrContentBlocks = convertFromHTML(html);
    contentState = ContentState.createFromBlockArray(arrContentBlocks);
    result = draftToBBCode(convertToRaw(contentState));
    assert.equal(output, result);

    html = '<ol><li>1</li>\n<ol><li>2</li>\n<ol><li>3</li>\n</ol>\n</ol>\n<li>3</li>\n</ol>\n';
    output = '[list=1]\n[*]1\n[list=1]\n[*]2\n[list=1]\n[*]3\n[/list]\n[/list]\n[*]3\n[/list]\n';
    arrContentBlocks = convertFromHTML(html);
    contentState = ContentState.createFromBlockArray(arrContentBlocks);
    result = draftToBBCode(convertToRaw(contentState));
    assert.equal(output, result);
  });

  it('should return correct result for different heading styles', () => {
    let html = '<h1>testing</h1>\n';
    let output = '[h1]testing[/h1]\n';
    let arrContentBlocks = convertFromHTML(html);
    let contentState = ContentState.createFromBlockArray(arrContentBlocks);
    let result = draftToBBCode(convertToRaw(contentState));
    assert.equal(output, result);

    html = '<h2>testing</h2>\n';
    output = '[h2]testing[/h2]\n';
    arrContentBlocks = convertFromHTML(html);
    contentState = ContentState.createFromBlockArray(arrContentBlocks);
    result = draftToBBCode(convertToRaw(contentState));
    assert.equal(output, result);

    html = '<blockquote>testing</blockquote>\n';
    output = '[quote]testing[/quote]\n';
    arrContentBlocks = convertFromHTML(html);
    contentState = ContentState.createFromBlockArray(arrContentBlocks);
    result = draftToBBCode(convertToRaw(contentState));
    assert.equal(output, result);
  });
});
