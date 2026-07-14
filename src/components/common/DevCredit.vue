<template>
  <div class="dev-credit">
    <a
      class="dev-credit__main"
      :href="href"
      target="_blank"
      rel="noopener noreferrer"
      :aria-label="`${name} — ${label}`"
    >
      <span class="dev-credit__mark" aria-hidden="true">ML</span>
      <span class="dev-credit__copy">
        <span class="dev-credit__kicker">{{ label }}</span>
        <span class="dev-credit__name">{{ name }}</span>
      </span>
    </a>

    <a
      class="dev-credit__wa"
      :href="whatsappHref"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      title="WhatsApp"
    >
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
        <path
          fill="currentColor"
          d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
        />
      </svg>
    </a>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, default: 'Desarrollado por' },
  name: { type: String, default: 'Mirko Limas' },
  href: { type: String, default: 'https://www.instagram.com/limasmirko/' },
  /** WhatsApp personal */
  whatsappHref: {
    type: String,
    default:
      'https://wa.me/51946144801?text=Hola%20Mirko%2C%20vi%20la%20web%20de%20Chacas%20Xtreme%20Race%20y%20me%20interesa%20una%20plataforma%20similar',
  },
});
</script>

<style scoped>
.dev-credit {
  --dc-fg: rgba(255, 255, 255, 0.52);
  --dc-muted: rgba(255, 255, 255, 0.34);
  --dc-line: rgba(255, 255, 255, 0.1);
  --dc-accent: var(--primary-color, #ff5e00);

  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  max-width: 100%;
  padding: 0.35rem 0.4rem 0.35rem 0.35rem;
  border: 1px solid transparent;
  border-radius: 999px;
  transition:
    border-color 220ms ease,
    background 220ms ease,
    box-shadow 220ms ease;
}

.dev-credit__main {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  min-width: 0;
  text-decoration: none;
  color: inherit;
}

.dev-credit__mark {
  flex-shrink: 0;
  width: 1.7rem;
  height: 1.7rem;
  display: inline-grid;
  place-items: center;
  border-radius: 50%;
  border: 1px solid rgba(255, 94, 0, 0.35);
  background: rgba(255, 94, 0, 0.08);
  color: var(--dc-accent);
  font-family: var(--font-accent, 'Poppins', system-ui, sans-serif);
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.06em;
}

.dev-credit__copy {
  display: flex;
  flex-direction: column;
  gap: 0.05rem;
  min-width: 0;
  line-height: 1.15;
}

.dev-credit__kicker {
  font-family: var(--font-accent, 'Poppins', system-ui, sans-serif);
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--dc-muted);
  transition: color 220ms ease;
}

.dev-credit__name {
  font-family: var(--font-accent, 'Poppins', system-ui, sans-serif);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: var(--dc-fg);
  white-space: nowrap;
  transition: color 220ms ease;
}

.dev-credit__wa {
  flex-shrink: 0;
  width: 1.85rem;
  height: 1.85rem;
  display: inline-grid;
  place-items: center;
  border-radius: 50%;
  color: #25d366;
  background: rgba(37, 211, 102, 0.1);
  border: 1px solid rgba(37, 211, 102, 0.28);
  transition: background 200ms ease, border-color 200ms ease, transform 200ms ease, color 200ms ease;
}

.dev-credit__wa:hover {
  background: rgba(37, 211, 102, 0.2);
  border-color: rgba(37, 211, 102, 0.55);
  transform: scale(1.06);
  color: #2fe076;
}

@media (hover: hover) and (pointer: fine) {
  .dev-credit:hover {
    border-color: var(--dc-line);
    background: rgba(255, 255, 255, 0.03);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  }

  .dev-credit:hover .dev-credit__kicker {
    color: rgba(255, 94, 0, 0.8);
  }

  .dev-credit:hover .dev-credit__name {
    color: #fff;
  }

  .dev-credit:hover .dev-credit__mark {
    border-color: rgba(255, 94, 0, 0.65);
    background: rgba(255, 94, 0, 0.14);
  }
}
</style>
