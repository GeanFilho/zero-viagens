export function el(tag, className, content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (typeof content === 'string') node.innerText = content;
  else if (content instanceof Node) node.appendChild(content);
  return node;
}

export function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = el('div', 'toast');
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2100);
}
