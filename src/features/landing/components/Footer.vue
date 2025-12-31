<script setup>
import { Instagram, Facebook, MessageCircle, MapPin, Mail, Phone, ChevronRight } from 'lucide-vue-next';
</script>

<template>
  <footer class="footer">
    <div class="container footer__grid">
      <!-- Company Info -->
      <div class="footer__brand">
        <div class="navbar__logo mb-2">
          <span class="logo-text">CHACAS</span>
          <span class="logo-accent"><span class="x-accent">X</span>TREME RACE</span>
        </div>
        <p class="footer__text">
          Llevando el ciclismo de montaña a un nuevo nivel en el corazón de los Andes. 
          Únete a la aventura más extrema del Perú.
        </p>
        <div class="footer__socials">
          <a href="#" class="social-link" aria-label="Instagram"><Instagram :size="20" /></a>
          <a href="#" class="social-link" aria-label="Facebook"><Facebook :size="20" /></a>
          <a href="#" class="social-link social-link--wa" aria-label="WhatsApp"><MessageCircle :size="20" /></a>
        </div>
      </div>

      <!-- Quick Links -->
      <div class="footer__links">
        <h4 class="footer__title">Navegación</h4>
        <ul>
          <li><a href="#inicio"><ChevronRight :size="16" /> Inicio</a></li>
          <li><a href="#sobre-nosotros"><ChevronRight :size="16" /> Sobre Nosotros</a></li>
          <li><a href="#"><ChevronRight :size="16" /> Competencias</a></li>
          <li><a href="#"><ChevronRight :size="16" /> Inscripciones</a></li>
        </ul>
      </div>

      <!-- Contact Info -->
      <div class="footer__contact">
        <h4 class="footer__title">Contacto</h4>
        <ul class="contact-list">
          <li>
            <MapPin :size="18" class="contact-icon" />
            <span>Plaza de Armas de Chacas, Áncash, Perú</span>
          </li>
          <li>
            <Phone :size="18" class="contact-icon" />
            <span>+51 987 654 321</span>
          </li>
          <li>
            <Mail :size="18" class="contact-icon" />
            <span>contacto@mankariders.com</span>
          </li>
        </ul>
      </div>

      <!-- Map -->
      <div class="footer__map">
        <h4 class="footer__title">Ubicación</h4>
        <div class="map-wrapper">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15754.673859344423!2d-77.3712128790076!3d-9.158784869408643!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91adb06716a47a75%3A0xe9c869480dc3b56!2sChacas%2C%20Peru!5e0!3m2!1sen!2sus!4v1703893000000!5m2!1sen!2sus" 
            width="100%" 
            height="150" 
            style="border:0;" 
            allowfullscreen="" 
            loading="lazy" 
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </div>

    <div class="footer__bottom">
      <div class="container footer__bottom-content">
        <p>&copy; 2025 Manka Rider's. Todos los derechos reservados.</p>
        <div class="footer__legal">
          <a href="#">Términos y Condiciones</a>
          <a href="#">Política de Privacidad</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: #080808;
  padding-top: 6rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  font-family: var(--font-main);
}

.footer__grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1.5fr;
  gap: 4rem;
  padding-bottom: 4rem;
}

.mb-2 { margin-bottom: 1.5rem; }

.footer__brand .logo-text {
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
}

.footer__brand .logo-accent {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--primary-color);
}

.footer__brand .x-accent {
  color: var(--accent-red);
}

.footer__text {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.7;
  margin-bottom: 2rem;
}

.footer__socials {
  display: flex;
  gap: 1rem;
}

.social-link {
  width: 45px;
  height: 45px;
  background: var(--surface-color);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: var(--transition-smooth);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.social-link:hover {
  background: var(--accent-gradient);
  color: black;
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(255, 94, 0, 0.2);
}

.social-link--wa:hover {
  background: #25d366;
  box-shadow: 0 10px 20px rgba(37, 211, 102, 0.2);
}

.footer__title {
  font-family: var(--font-accent);
  font-size: 1.1rem;
  font-weight: 700;
  color: white;
  margin-bottom: 2rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.footer__links ul li {
  margin-bottom: 1rem;
}

.footer__links ul li a {
  color: var(--text-secondary);
  transition: var(--transition-smooth);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.footer__links ul li a:hover {
  color: var(--primary-color);
  padding-left: 5px;
}

.contact-list li {
  display: flex;
  gap: 1rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  align-items: flex-start;
}

.contact-icon {
  color: var(--primary-color);
  flex-shrink: 0;
}

.map-wrapper {
  border-radius: 15px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  filter: grayscale(1) invert(0.9) contrast(1.2); /* Dark Map Mode */
  transition: var(--transition-smooth);
}

.map-wrapper:hover {
  filter: grayscale(0) invert(0) contrast(1);
}

.footer__bottom {
  padding: 2rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.footer__bottom-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.footer__legal {
  display: flex;
  gap: 2rem;
}

.footer__legal a {
  transition: var(--transition-smooth);
}

.footer__legal a:hover {
  color: white;
}

@media (max-width: 1200px) {
  .footer__grid {
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
  }
}

@media (max-width: 768px) {
  .footer {
    padding-top: 4rem;
  }
}

@media (max-width: 600px) {
  .footer__grid {
    grid-template-columns: 1fr;
  }
  
  .footer__bottom-content {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }
  
  .footer__legal {
    justify-content: center;
    gap: 1rem;
  }
}
</style>
