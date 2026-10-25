const instances = new Map();
let currentInstance = null;
let hookIndex = 0;
let rootElement = null;
let rootComponent = null;
let pendingRender = false;
const pendingEffects = [];

export const Fragment = Symbol('Fragment');

function scheduleRender() {
  if (pendingRender) return;
  pendingRender = true;
  queueMicrotask(() => {
    pendingRender = false;
    if (rootElement && rootComponent) renderRoot();
  });
}

function getInstance(path, component) {
  let instance = instances.get(path);
  if (!instance || instance.component !== component) {
    instance = { component, hooks: [], effects: [], cleanups: [] };
    instances.set(path, instance);
  }
  return instance;
}

export function useState(initialValue) {
  const instance = currentInstance;
  const index = hookIndex++;
  if (!(index in instance.hooks)) {
    instance.hooks[index] = typeof initialValue === 'function' ? initialValue() : initialValue;
  }
  const setValue = (nextValue) => {
    const next = typeof nextValue === 'function' ? nextValue(instance.hooks[index]) : nextValue;
    if (!Object.is(next, instance.hooks[index])) {
      instance.hooks[index] = next;
      scheduleRender();
    }
  };
  return [instance.hooks[index], setValue];
}

export function useRef(initialValue) {
  const instance = currentInstance;
  const index = hookIndex++;
  if (!(index in instance.hooks)) instance.hooks[index] = { current: initialValue };
  return instance.hooks[index];
}

export function useMemo(factory, deps) {
  const instance = currentInstance;
  const index = hookIndex++;
  const previous = instance.hooks[index];
  if (!previous || !deps || deps.some((dep, i) => !Object.is(dep, previous.deps[i]))) {
    instance.hooks[index] = { value: factory(), deps: deps ? [...deps] : undefined };
  }
  return instance.hooks[index].value;
}

export function useEffect(effect, deps) {
  const instance = currentInstance;
  const index = hookIndex++;
  const previous = instance.hooks[index];
  const changed = !previous || !deps || deps.some((dep, i) => !Object.is(dep, previous.deps[i]));
  instance.hooks[index] = { deps: deps ? [...deps] : undefined };
  if (changed) {
    pendingEffects.push(() => {
      if (instance.cleanups[index]) instance.cleanups[index]();
      const cleanup = effect();
      instance.cleanups[index] = typeof cleanup === 'function' ? cleanup : null;
    });
  }
}

export function h(type, props, ...children) {
  return { type, props: props || {}, children: children.flat(Infinity).filter((child) => child !== null && child !== undefined && child !== false) };
}

function setProperty(element, name, value) {
  if (name === 'children' || name === 'key' || value === null || value === undefined || value === false) return;
  if (name === 'className') {
    element.setAttribute('class', value);
    return;
  }
  if (name === 'htmlFor') {
    element.setAttribute('for', value);
    return;
  }
  if (name === 'style' && typeof value === 'object') {
    Object.assign(element.style, value);
    return;
  }
  if (name === 'dangerouslySetInnerHTML' && value && typeof value.__html === 'string') {
    element.innerHTML = value.__html;
    return;
  }
  if (name.startsWith('on') && typeof value === 'function') {
    element.addEventListener(name.slice(2).toLowerCase(), value);
    return;
  }
  if (name === 'value' || name === 'checked' || name === 'selected' || name === 'disabled' || name === 'multiple' || name === 'readOnly' || name === 'required') {
    try { element[name] = value; } catch { /* ignore read-only DOM properties */ }
    if (value) element.setAttribute(name.toLowerCase(), '');
    return;
  }
  if (name === 'ref' && value && typeof value === 'object') {
    value.current = element;
    return;
  }
  if (name === 'aria-label' || name.startsWith('aria-') || name.startsWith('data-')) {
    element.setAttribute(name, String(value));
    return;
  }
  if (value === true) {
    element.setAttribute(name, '');
  } else {
    element.setAttribute(name, String(value));
  }
}

function renderVNode(vnode, path) {
  if (typeof vnode === 'string' || typeof vnode === 'number') return document.createTextNode(String(vnode));
  if (!vnode) return document.createDocumentFragment();
  if (Array.isArray(vnode)) {
    const fragment = document.createDocumentFragment();
    vnode.forEach((child, index) => fragment.appendChild(renderVNode(child, `${path}.${index}`)));
    return fragment;
  }
  if (vnode.type === Fragment) {
    const fragment = document.createDocumentFragment();
    vnode.children.forEach((child, index) => fragment.appendChild(renderVNode(child, `${path}.${index}`)));
    return fragment;
  }
  if (typeof vnode.type === 'function') {
    const childPath = vnode.props.key != null ? `${path}:${vnode.props.key}` : path;
    const instance = getInstance(childPath, vnode.type);
    const previous = currentInstance;
    currentInstance = instance;
    hookIndex = 0;
    const output = vnode.type(vnode.props);
    currentInstance = previous;
    return renderVNode(output, childPath);
  }
  const element = document.createElement(vnode.type);
  Object.entries(vnode.props).forEach(([name, value]) => setProperty(element, name, value));
  vnode.children.forEach((child, index) => element.appendChild(renderVNode(child, `${path}.${index}`)));
  return element;
}

function renderRoot() {
  pendingEffects.length = 0;
  const previous = currentInstance;
  currentInstance = null;
  hookIndex = 0;
  const output = typeof rootComponent === 'function' ? h(rootComponent, {}) : rootComponent;
  const nextTree = renderVNode(output, 'root');
  currentInstance = previous;
  rootElement.replaceChildren(nextTree);
  const effects = pendingEffects.splice(0);
  effects.forEach((run) => run());
}

export function mount(component, element = document.getElementById('root')) {
  rootComponent = component;
  rootElement = element;
  renderRoot();
}
