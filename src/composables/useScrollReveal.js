import { onMounted, onUnmounted } from 'vue';

export function useScrollReveal(options = {}) {
  const {
    selector = '.reveal, .reveal-stagger',
    threshold = 0.12,
    rootMargin = '0px 0px -6% 0px',
    once = true,
  } = options;

  let observer = null;

  const observe = () => {
    if (!observer) return;
    document.querySelectorAll(selector).forEach((el) => observer.observe(el));
  };

  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal--visible');
            if (once) observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    observe();
  });

  onUnmounted(() => {
    observer?.disconnect();
  });

  return { observe };
}
