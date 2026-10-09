(function (root) {
  'use strict';
  const round = n => Math.round((n + Number.EPSILON) * 100) / 100;
  const key = (size, id) => `${size}:${id}`;
  const hasOverride = (state, size, id) => Object.hasOwn(state.overrides, key(size, id));
  function numeric(value, max = 9999) {
    if (value === '' || value === null || typeof value === 'boolean' || !Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > max) throw new Error(`请输入 0–${max} 之间的尺寸数值。`);
    return round(Number(value));
  }
  function dimension(state, id) { const dim = state.dimensions.find(d => d.id === id); if (!dim) throw new Error('尺寸维度不存在。'); return dim; }
  function checkSize(state, size) { if (!state.sizes.includes(size)) throw new Error('尺码不存在。'); }
  function automatic(state, size, dim) { checkSize(state, size); return round(dim.base + (state.sizes.indexOf(size) - state.sizes.indexOf(state.baseSize)) * dim.step); }
  function value(state, size, dim) { checkSize(state, size); return hasOverride(state, size, dim.id) ? state.overrides[key(size, dim.id)] : automatic(state, size, dim); }
  function setCell(state, size, id, input) { checkSize(state, size); dimension(state, id); state.overrides[key(size, id)] = numeric(input); }
  function setRule(state, id, property, input) { if (!['base','step'].includes(property)) throw new Error('无效的规则字段。'); dimension(state, id)[property] = numeric(input, property === 'step' ? 999 : 9999); }
  function setBaseSize(state, size) { checkSize(state, size); const next = state.dimensions.map(d => numeric(value(state, size, d))); state.dimensions.forEach((d, i) => { d.base = next[i]; delete state.overrides[key(size, d.id)]; }); state.baseSize = size; }
  function restoreCell(state, size, id) { checkSize(state, size); dimension(state, id); delete state.overrides[key(size, id)]; }
  function setSizes(state, input) {
    if (typeof input !== 'string') throw new Error('请输入按从小到大排序的尺码。');
    const sizes = input.trim().split(/[\s,，、;；]+/u).filter(Boolean);
    if (sizes.length < 1 || sizes.length > 20) throw new Error('请设置 1–20 个尺码。');
    if (new Set(sizes).size !== sizes.length) throw new Error('尺码不能重复。');
    if (sizes.some(s => s.length > 10 || /[:<>]/.test(s))) throw new Error('每个尺码最多 10 个字符，不能包含冒号或尖括号。');
    const retainedBase = sizes.includes(state.baseSize);
    const nextBase = retainedBase ? state.baseSize : sizes.find(s => state.sizes.includes(s)) || sizes[0];
    const nextValues = state.dimensions.map(d => numeric(retainedBase ? d.base : state.sizes.includes(nextBase) ? value(state, nextBase, d) : d.base));
    state.dimensions.forEach((d, i) => { d.base = nextValues[i]; if (!retainedBase) delete state.overrides[key(nextBase, d.id)]; }); state.baseSize = nextBase;
    for (const k of Object.keys(state.overrides)) if (!sizes.includes(k.slice(0, k.lastIndexOf(':')))) delete state.overrides[k];
    state.sizes = sizes; for (const s of sizes) if (!Object.hasOwn(state.guide, s)) state.guide[s] = '';
  }
  function addDimension(state, name, base, step) {
    if (typeof name !== 'string' || !name.trim() || name.trim().length > 12) throw new Error('尺寸名称需为 1–12 个字符。');
    if (state.dimensions.length >= 12) throw new Error('最多支持 12 个尺寸维度。');
    if (state.dimensions.some(d => d.name === name.trim())) throw new Error('该尺寸名称已存在。');
    state.dimensions.push({ id: `d${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, name: name.trim(), base: numeric(base), step: numeric(step, 999) });
  }
  function removeDimension(state, id) { dimension(state, id); if (state.dimensions.length <= 1) throw new Error('至少保留一个尺寸维度。'); state.dimensions = state.dimensions.filter(d => d.id !== id); for (const k of Object.keys(state.overrides)) if (k.endsWith(`:${id}`)) delete state.overrides[k]; }
  function invalidCells(state) { return state.sizes.flatMap(s => state.dimensions.filter(d => { const n = value(state, s, d); return n < 0 || n > 9999; }).map(d => `${s} 码${d.name}`)); }
  function read(state) { return { baseSize: state.baseSize, dimensions: structuredClone(state.dimensions), rows: state.sizes.map(s => ({ size: s, values: Object.fromEntries(state.dimensions.map(d => [d.name, value(state, s, d)])), manualDimensions: state.dimensions.filter(d => hasOverride(state, s, d.id)).map(d => d.name) })), styleNo: state.styleNo, title: state.title }; }
  const api = { numeric, key, hasOverride, automatic, value, setCell, setRule, setBaseSize, restoreCell, setSizes, addDimension, removeDimension, invalidCells, read };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.ChartModel = api;
})(globalThis);
