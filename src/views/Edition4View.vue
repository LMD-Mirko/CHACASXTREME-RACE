<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { 
  Users, 
  Activity, 
  Award, 
  ArrowLeft,
  Handshake,
  Play,
  RefreshCw,
  Zap,
  MapPin
} from 'lucide-vue-next';

// Import subcomponents
import RidersPadron from '@/features/edition4/components/RidersPadron.vue';
import LiveTelemetry from '@/features/edition4/components/LiveTelemetry.vue';
import LeaderboardResults from '@/features/edition4/components/LeaderboardResults.vue';
import SponsorsList from '@/features/edition4/components/SponsorsList.vue';
import Edition4SplashScreen from '@/features/edition4/components/Edition4SplashScreen.vue';

const showSplash = ref(true);
const route = useRoute();
const router = useRouter();
const { t } = useI18n();

// Tabs System Linked to Route Hash
const activeTab = ref('padron'); // default
const tabs = [
  { id: 'padron', name: 'Padrón', icon: Users, hash: '#padron' },
  { id: 'resultados', name: 'Resultados', icon: Award, hash: '#resultados' }
];

watch(() => route.hash, (newHash) => {
  const matchingTab = tabs.find(tab => tab.hash === newHash);
  if (matchingTab) {
    activeTab.value = matchingTab.id;
  } else {
    router.replace({ path: route.path, hash: '#padron' });
  }
}, { immediate: true });

const changeTab = (tabId) => {
  activeTab.value = tabId;
  const hash = `#${tabId}`;
  router.push({ path: route.path, hash });
};

// -------------------------------------------------------------
// GLOBAL MOCK DATA STATE (SHARED ACCROSS TABS)
// -------------------------------------------------------------
const baseRiders = [
  // ELITE (40 riders)
  {
    id: 1,
    nombres_completos: "Mirko Daniel Ramos Limas",
    dni: "72145638",
    apodo: "El Rayo de Asunción",
    categoria_elegida: "Elite",
    procedencia: "Chacas",
    club_team: "Ancash Riders Team",
    instagram: "mirko_ramos_dh",
    telefono_emergencia: "943882211",
    foto_url: "https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 45,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 2,
    nombres_completos: "Carlos Mendoza Vega",
    dni: "45871296",
    apodo: "Chemo",
    categoria_elegida: "Elite",
    procedencia: "Huaraz",
    club_team: "Cordillera Blanca DH",
    instagram: "chemo_mendoza",
    telefono_emergencia: "920114455",
    foto_url: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 12,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 9,
    nombres_completos: "José Ignacio 'El Demonio'",
    dni: "71248963",
    apodo: "El Demonio",
    categoria_elegida: "Elite",
    procedencia: "Chacas",
    club_team: "Manka Riders Elite",
    instagram: "eldemonio.mtb",
    telefono_emergencia: "983426996",
    foto_url: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 7,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 10,
    nombres_completos: "Luigi Travi Elite",
    dni: "41258963",
    apodo: "Gigi",
    categoria_elegida: "Elite",
    procedencia: "Lima",
    club_team: "Manka Riders Elite",
    instagram: "luigitravi",
    telefono_emergencia: "916773344",
    foto_url: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 10,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  // New Elite Riders (36 riders to total 40 in Elite)
  {
    id: 11,
    nombres_completos: "Sergio Balanza Huaraz",
    dni: "72841269",
    apodo: "El Checho",
    categoria_elegida: "Elite",
    procedencia: "Huaraz",
    club_team: "Ancash Riders",
    instagram: "sergio_balanza",
    telefono_emergencia: "956336688",
    foto_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 101,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 12,
    nombres_completos: "Mateo Ganoza Trujillo",
    dni: "42158739",
    apodo: "Teo",
    categoria_elegida: "Elite",
    procedencia: "Trujillo",
    club_team: "Chimu Downhill",
    instagram: "teo_ganoza",
    telefono_emergencia: "948123456",
    foto_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 102,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 13,
    nombres_completos: "Julio Cesar Cueva",
    dni: "70125893",
    apodo: "Julito",
    categoria_elegida: "Elite",
    procedencia: "Chacas",
    club_team: "Manka Riders",
    instagram: "julio_cueva",
    telefono_emergencia: "983445566",
    foto_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 103,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 14,
    nombres_completos: "Fabricio Peralta Arequipa",
    dni: "48259617",
    apodo: "Fabri",
    categoria_elegida: "Elite",
    procedencia: "Arequipa",
    club_team: "Misti DH",
    instagram: "fabri_peralta",
    telefono_emergencia: "959123789",
    foto_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 104,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 15,
    nombres_completos: "Gonzalo Chavez Lima",
    dni: "74125893",
    apodo: "Gonza",
    categoria_elegida: "Elite",
    procedencia: "Lima",
    club_team: "Lima Downhill Club",
    instagram: "gonza_chavez",
    telefono_emergencia: "991223344",
    foto_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 105,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 16,
    nombres_completos: "Nicolas Lopez Chacas",
    dni: "72149635",
    apodo: "Nico",
    categoria_elegida: "Elite",
    procedencia: "Chacas",
    club_team: "Manka Riders",
    instagram: "nico_chacas",
    telefono_emergencia: "925663344",
    foto_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 106,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 17,
    nombres_completos: "Gabriel Ruiz Caraz",
    dni: "41029384",
    apodo: "Gabo",
    categoria_elegida: "Elite",
    procedencia: "Caraz",
    club_team: "Callejon de Huaylas DH",
    instagram: "gabo_ruiz",
    telefono_emergencia: "943009988",
    foto_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 107,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 18,
    nombres_completos: "Sebastian Valdivia Cuzco",
    dni: "76152439",
    apodo: "Sebas",
    categoria_elegida: "Elite",
    procedencia: "Cusco",
    club_team: "Inka Riders Cusco",
    instagram: "sebas_cusco",
    telefono_emergencia: "984123456",
    foto_url: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 108,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 19,
    nombres_completos: "Rodrigo Rivas Huaraz",
    dni: "43129845",
    apodo: "Rorro",
    categoria_elegida: "Elite",
    procedencia: "Huaraz",
    club_team: "Ancash Riders",
    instagram: "rorro_rivas",
    telefono_emergencia: "920123987",
    foto_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 109,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 20,
    nombres_completos: "Adrian Fernandez Chacas",
    dni: "75124963",
    apodo: "Adru",
    categoria_elegida: "Elite",
    procedencia: "Chacas",
    club_team: "Manka Riders",
    instagram: "adrian_chacas",
    telefono_emergencia: "983112233",
    foto_url: "https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 110,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 21,
    nombres_completos: "Daniel Torres Yungay",
    dni: "41982736",
    apodo: "Dani",
    categoria_elegida: "Elite",
    procedencia: "Yungay",
    club_team: "Huascaran Extreme",
    instagram: "dani_torres",
    telefono_emergencia: "943990011",
    foto_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 111,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 22,
    nombres_completos: "Marcos Estrada Huaraz",
    dni: "74012938",
    apodo: "Marquito",
    categoria_elegida: "Elite",
    procedencia: "Huaraz",
    club_team: "Cordillera Blanca DH",
    instagram: "marcos_estrada",
    telefono_emergencia: "921887766",
    foto_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 112,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 23,
    nombres_completos: "Franco Merino Lima",
    dni: "45091827",
    apodo: "Fran",
    categoria_elegida: "Elite",
    procedencia: "Lima",
    club_team: "Lima Downhill Club",
    instagram: "fran_merino",
    telefono_emergencia: "991334455",
    foto_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 113,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 24,
    nombres_completos: "Lucas Espinoza Caraz",
    dni: "73129845",
    apodo: "Luquitas",
    categoria_elegida: "Elite",
    procedencia: "Caraz",
    club_team: "Callejon de Huaylas DH",
    instagram: "lucas_espinoza",
    telefono_emergencia: "943776655",
    foto_url: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 114,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 25,
    nombres_completos: "Joaquin Salazar Trujillo",
    dni: "71029384",
    apodo: "Joaco",
    categoria_elegida: "Elite",
    procedencia: "Trujillo",
    club_team: "Chimu Downhill",
    instagram: "joaco_salazar",
    telefono_emergencia: "948223344",
    foto_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 115,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 26,
    nombres_completos: "Bruno Caceres Chacas",
    dni: "42938401",
    apodo: "Brunito",
    categoria_elegida: "Elite",
    procedencia: "Chacas",
    club_team: "Manka Riders",
    instagram: "bruno_caceres",
    telefono_emergencia: "983223399",
    foto_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 116,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 27,
    nombres_completos: "Alejandro Flores Arequipa",
    dni: "70928134",
    apodo: "Alejo",
    categoria_elegida: "Elite",
    procedencia: "Arequipa",
    club_team: "Misti DH",
    instagram: "alejo_flores",
    telefono_emergencia: "959334455",
    foto_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 117,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 28,
    nombres_completos: "Santiago Ramos Chacas",
    dni: "73109283",
    apodo: "Santi",
    categoria_elegida: "Elite",
    procedencia: "Chacas",
    club_team: "Manka Riders",
    instagram: "santi_ramos",
    telefono_emergencia: "983778899",
    foto_url: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 118,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 29,
    nombres_completos: "Mauricio Delgado Lima",
    dni: "41928374",
    apodo: "Mauri",
    categoria_elegida: "Elite",
    procedencia: "Lima",
    club_team: "Lima Downhill Club",
    instagram: "mauri_delgado",
    telefono_emergencia: "991556677",
    foto_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 119,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 30,
    nombres_completos: "Ricardo Ortiz Huaraz",
    dni: "75849301",
    apodo: "Richi",
    categoria_elegida: "Elite",
    procedencia: "Huaraz",
    club_team: "Cordillera Blanca DH",
    instagram: "richi_ortiz",
    telefono_emergencia: "920334455",
    foto_url: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 120,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 31,
    nombres_completos: "Leonardo Vega Yungay",
    dni: "70192834",
    apodo: "Leo",
    categoria_elegida: "Elite",
    procedencia: "Yungay",
    club_team: "Huascaran Extreme",
    instagram: "leo_vega",
    telefono_emergencia: "943110022",
    foto_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 121,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 32,
    nombres_completos: "Javier Mendoza Caraz",
    dni: "43928174",
    apodo: "Javi",
    categoria_elegida: "Elite",
    procedencia: "Caraz",
    club_team: "Callejon de Huaylas DH",
    instagram: "javi_mendoza",
    telefono_emergencia: "943887711",
    foto_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 122,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 33,
    nombres_completos: "Alvaro Pinedo Lima",
    dni: "71092837",
    apodo: "Alvarito",
    categoria_elegida: "Elite",
    procedencia: "Lima",
    club_team: "Lima Downhill Club",
    instagram: "alvaro_pinedo",
    telefono_emergencia: "991889900",
    foto_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 123,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 34,
    nombres_completos: "Hugo Vasquez Chacas",
    dni: "72938401",
    apodo: "Huguito",
    categoria_elegida: "Elite",
    procedencia: "Chacas",
    club_team: "Manka Riders",
    instagram: "hugo_vasquez",
    telefono_emergencia: "983445599",
    foto_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 124,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 35,
    nombres_completos: "Fernando Castro Huaraz",
    dni: "44019283",
    apodo: "Fer",
    categoria_elegida: "Elite",
    procedencia: "Huaraz",
    club_team: "Ancash Riders",
    instagram: "fer_castro",
    telefono_emergencia: "920776655",
    foto_url: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 125,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 36,
    nombres_completos: "Matias Gomez Yungay",
    dni: "75928103",
    apodo: "Mati",
    categoria_elegida: "Elite",
    procedencia: "Yungay",
    club_team: "Huascaran Extreme",
    instagram: "mati_gomez",
    telefono_emergencia: "943221100",
    foto_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 126,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 37,
    nombres_completos: "Cristian Rojas Caraz",
    dni: "71928304",
    apodo: "Cris",
    categoria_elegida: "Elite",
    procedencia: "Caraz",
    club_team: "Callejon de Huaylas DH",
    instagram: "cris_rojas",
    telefono_emergencia: "943554433",
    foto_url: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 127,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 38,
    nombres_completos: "Felipe Herrera Trujillo",
    dni: "42109283",
    apodo: "Feli",
    categoria_elegida: "Elite",
    procedencia: "Trujillo",
    club_team: "Chimu Downhill",
    instagram: "feli_herrera",
    telefono_emergencia: "948443322",
    foto_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 128,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 39,
    nombres_completos: "Samuel Mendez Chacas",
    dni: "73928104",
    apodo: "Samu",
    categoria_elegida: "Elite",
    procedencia: "Chacas",
    club_team: "Manka Riders",
    instagram: "samu_mendez",
    telefono_emergencia: "983114477",
    foto_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 129,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 40,
    nombres_completos: "Diego Alexander Ramos",
    dni: "72918273",
    apodo: "Ale",
    categoria_elegida: "Elite",
    procedencia: "Chacas",
    club_team: "Ancash Riders",
    instagram: "ale_ramos_dh",
    telefono_emergencia: "943881100",
    foto_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 130,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 41,
    nombres_completos: "Ignacio Valenzuela Lima",
    dni: "41909283",
    apodo: "Nacho",
    categoria_elegida: "Elite",
    procedencia: "Lima",
    club_team: "Lima Downhill Club",
    instagram: "nacho_valen",
    telefono_emergencia: "991448899",
    foto_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 131,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 42,
    nombres_completos: "Roberto Villanueva Huaraz",
    dni: "75928139",
    apodo: "Beto",
    categoria_elegida: "Elite",
    procedencia: "Huaraz",
    club_team: "Ancash Riders",
    instagram: "beto_villa",
    telefono_emergencia: "920114400",
    foto_url: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 132,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 43,
    nombres_completos: "Marcelo Cisneros Yungay",
    dni: "70928374",
    apodo: "Marce",
    categoria_elegida: "Elite",
    procedencia: "Yungay",
    club_team: "Huascaran Extreme",
    instagram: "marce_cisneros",
    telefono_emergencia: "943224455",
    foto_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 133,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 44,
    nombres_completos: "Luis Enrique Prado",
    dni: "42918274",
    apodo: "Kike",
    categoria_elegida: "Elite",
    procedencia: "Lima",
    club_team: "Manka Riders",
    instagram: "kike_prado",
    telefono_emergencia: "991550011",
    foto_url: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 134,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 45,
    nombres_completos: "Gustavo Adolfo Becerra",
    dni: "71928374",
    apodo: "Gus",
    categoria_elegida: "Elite",
    procedencia: "Arequipa",
    club_team: "Misti DH",
    instagram: "gus_becerra",
    telefono_emergencia: "959009988",
    foto_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 135,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 46,
    nombres_completos: "Angel Daniel Castillo",
    dni: "72938491",
    apodo: "Dani Castillo",
    categoria_elegida: "Elite",
    procedencia: "Chacas",
    club_team: "Manka Riders",
    instagram: "dani_castillo",
    telefono_emergencia: "983776611",
    foto_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 136,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  // JUNIOR
  {
    id: 3,
    nombres_completos: "Juan Pérez Guerrero",
    dni: "70125489",
    apodo: "El Gato",
    categoria_elegida: "Junior",
    procedencia: "Lima",
    club_team: "Independiente",
    instagram: "juan_perez_dh",
    telefono_emergencia: "916778899",
    foto_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 88,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 4,
    nombres_completos: "Diego Torres Huamán",
    dni: "48751236",
    apodo: "Chispita",
    categoria_elegida: "Junior",
    procedencia: "Carhuaz",
    club_team: "Carhuaz Downhill Club",
    instagram: "diego_torres_ch",
    telefono_emergencia: "952663300",
    foto_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 56,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  // RIGIDAS
  {
    id: 5,
    nombres_completos: "Luis Alberto Vega",
    dni: "46981247",
    apodo: "Lucho",
    categoria_elegida: "Rígidas",
    procedencia: "Chacas",
    club_team: "Manka Riders Club",
    instagram: "lucho_vega_dh",
    telefono_emergencia: "984552211",
    foto_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 72,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 6,
    nombres_completos: "Mateo Cerna Ortiz",
    dni: "74125896",
    apodo: "Matu",
    categoria_elegida: "Rígidas",
    procedencia: "Huaraz",
    club_team: "Huascarán DH",
    instagram: "mateocerna_dh",
    telefono_emergencia: "943228866",
    foto_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 19,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  // LOCALES
  {
    id: 7,
    nombres_completos: "Alejandro Tafur",
    dni: "73254125",
    apodo: "Alex",
    categoria_elegida: "Locales",
    procedencia: "Chacas",
    club_team: "Chacas DH",
    instagram: "alex_tafur_mtb",
    telefono_emergencia: "990112233",
    foto_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 9,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  },
  {
    id: 8,
    nombres_completos: "Sebastian Cueva",
    dni: "75841269",
    apodo: "Seba",
    categoria_elegida: "Locales",
    procedencia: "Chacas",
    club_team: "Manka Riders Club",
    instagram: "seba_cueva_dh",
    telefono_emergencia: "925336688",
    foto_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    numero_dorsal: 31,
    estado_carrera: "pre_inscrito",
    paso_p1: false,
    hora_p1: null,
    tiempo_meta: null,
    diferencia: "--:--"
  }
];

const ridersList = ref(JSON.parse(JSON.stringify(baseRiders)));

// -------------------------------------------------------------
// SIMULATION ENGINE (STATE HANDLED AT PARENT LEVEL)
// ------------------------------------------------------// -------------------------------------------------------------
// SIMULATION ENGINE (STATE HANDLED AT PARENT LEVEL) & WS EMULATOR
// -------------------------------------------------------------
const isSimulating = ref(false);
const liveTimeMs = ref(0);
const liveInterval = ref(null);
const routeProgress = ref(0);
const activeRiderOnMap = ref(null);

const simSpeed = ref('0.0');
const simAltimetry = ref(3800);
const simHeartRate = ref(0);

// Simulated WS Notification States
const activeSimPassedAlert = ref(null);
const activeSimFinishedAlert = ref(null);

// Audio synthesis helpers
const playTickSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
  } catch (e) {}
};

const playVictoryArpeggio = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      }, idx * 100);
    });
  } catch (e) {}
};

// Simulated Notification Triggers
const triggerSimPassedAlert = (rider, customTime = null) => {
  playTickSound();
  activeSimPassedAlert.value = {
    plate_number: rider.numero_dorsal,
    full_name: rider.nombres_completos,
    elapsed_time: customTime || '01:23.450',
    category: rider.categoria_elegida || 'Elite'
  };
  setTimeout(() => {
    activeSimPassedAlert.value = null;
  }, 4000);
};

const triggerSimFinishedAlert = (rider, customTime = null) => {
  playVictoryArpeggio();
  
  // Calculate position in leaderboard
  const categoryRiders = ridersList.value
    .filter(r => r.categoria_elegida === rider.categoria_elegida && r.estado_carrera === 'llego')
    .sort((a, b) => (a.tiempo_meta || '').localeCompare(b.tiempo_meta || ''));
  
  let position = categoryRiders.findIndex(r => r.id === rider.id) + 1;
  if (position <= 0) position = 1;

  activeSimFinishedAlert.value = {
    plate_number: rider.numero_dorsal,
    full_name: rider.nombres_completos,
    net_time: customTime || rider.tiempo_meta || '03:14.450',
    category: rider.categoria_elegida || 'Elite',
    position: position
  };
  
  setTimeout(() => {
    activeSimFinishedAlert.value = null;
  }, 4200);
};

// Simulation methods triggers
const simulateCheckpointPass = () => {
  // Find a rider who hasn't passed P1 yet
  let rider = ridersList.value.find(r => !r.paso_p1 && r.estado_carrera !== 'DNS' && r.estado_carrera !== 'DNF' && r.estado_carrera !== 'llego');
  
  // Fallback: pick any random active rider and reset their P1 state
  if (!rider) {
    const activeRiders = ridersList.value.filter(r => r.estado_carrera !== 'DNS' && r.estado_carrera !== 'DNF');
    rider = activeRiders[Math.floor(Math.random() * activeRiders.length)];
  }
  
  if (rider) {
    rider.paso_p1 = true;
    const randomMins = Math.floor(Math.random() * 2) + 1; // 1 to 2 mins
    const randomSecs = Math.floor(Math.random() * 60);
    const randomMs = Math.floor(Math.random() * 100);
    const mockTime = `${String(randomMins).padStart(2,'0')}:${String(randomSecs).padStart(2,'0')}.${String(randomMs).padStart(2,'0')}`;
    
    rider.hora_p1 = `11:${String(randomMins).padStart(2,'0')}:${String(randomSecs).padStart(2,'0')}.${String(randomMs).padStart(3,'0')}`;
    
    // Trigger notification
    triggerSimPassedAlert(rider, mockTime);
  }
};

const simulateRiderFinish = () => {
  // Find a rider who has passed P1 but hasn't finished yet
  let rider = ridersList.value.find(r => r.paso_p1 && r.estado_carrera !== 'llego' && r.estado_carrera !== 'DNS' && r.estado_carrera !== 'DNF');
  
  // Fallback: pick any rider who hasn't finished
  if (!rider) {
    rider = ridersList.value.find(r => r.estado_carrera !== 'llego' && r.estado_carrera !== 'DNS' && r.estado_carrera !== 'DNF');
  }
  
  // Extreme Fallback: pick any random active rider and reset their state
  if (!rider) {
    const activeRiders = ridersList.value.filter(r => r.estado_carrera !== 'DNS' && r.estado_carrera !== 'DNF');
    rider = activeRiders[Math.floor(Math.random() * activeRiders.length)];
  }

  if (rider) {
    rider.estado_carrera = 'llego';
    rider.paso_p1 = true;
    
    // Generate a random net time between 03:14.00 and 04:15.00
    const randomMins = Math.floor(Math.random() * 2) + 3; // 3 to 4
    const randomSecs = Math.floor(Math.random() * 60);
    const randomMs = Math.floor(Math.random() * 100);
    const finalTime = `${String(randomMins).padStart(2,'0')}:${String(randomSecs).padStart(2,'0')}.${String(randomMs).padStart(2,'0')}`;
    
    rider.tiempo_meta = finalTime;

    // Recalculate differences relative to leader
    const categoryRiders = ridersList.value.filter(r => r.categoria_elegida === rider.categoria_elegida && r.estado_carrera === 'llego');
    const sorted = [...categoryRiders].sort((a,b) => a.tiempo_meta.localeCompare(b.tiempo_meta));
    const firstLlego = sorted[0];
    
    if (firstLlego) {
      ridersList.value.forEach(r => {
        if (r.categoria_elegida === rider.categoria_elegida && r.estado_carrera === 'llego') {
          if (r.id === firstLlego.id) {
            r.diferencia = '00:00.000';
          } else {
            const diffSecs = parseTimeToSeconds(r.tiempo_meta) - parseTimeToSeconds(firstLlego.tiempo_meta);
            r.diferencia = `+${formatDiffSeconds(diffSecs)}`;
          }
        }
      });
    }

    // Trigger notification
    triggerSimFinishedAlert(rider, finalTime);
  }
};



const parseTimeToSeconds = (timeStr) => {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  const mins = parseInt(parts[0], 10);
  const secsParts = parts[1].split('.');
  const secs = parseInt(secsParts[0], 10);
  const ms = parseInt(secsParts[1], 10) / 100;
  return mins * 60 + secs + ms;
};

const formatDiffSeconds = (secsVal) => {
  const mins = Math.floor(secsVal / 60);
  const secs = Math.floor(secsVal % 60);
  const ms = Math.floor((secsVal % 1) * 100);
  return `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}.${String(ms).padStart(2,'0')}`;
};

onUnmounted(() => {
  stopSimulation();
});
</script>

<template>
  <div class="edition4-view-root">
    <Edition4SplashScreen v-if="showSplash" @finish="showSplash = false" />
    <div v-else class="edition4-view">
    <!-- Dynamic Animated Background -->
    <div class="dynamic-ambient-bg">
      <div class="ambient-blob blob-orange"></div>
      <div class="ambient-blob blob-yellow"></div>
      <div class="ambient-blob blob-red"></div>
      <div class="speed-lines-grid"></div>
    </div>

    <!-- Grid editorial backgrounds -->
    <div class="editorial-grid">
      <div class="grid-col-line"></div>
      <div class="grid-col-line"></div>
      <div class="grid-col-line"></div>
      <div class="grid-col-line"></div>
    </div>
    <div class="carbon-mesh-overlay"></div>

    <!-- Floating Back Button (No navbar, self-contained exit) -->
    <div class="exit-container container">
      <button @click="router.push('/inicio')" class="btn-exit font-accent">
        <ArrowLeft :size="15" />
        <span>VOLVER AL INICIO</span>
      </button>
    </div>

    <!-- Header Section -->
    <header class="edition4-hero container">
      <div class="edition4-badge-wrap">
        <span class="edition4-badge">IV EDICIÓN OFICIAL</span>
        <span class="edition4-date">28 DE JULIO</span>
      </div>
      <h1 class="edition4-title font-podium">
        CHACAS <span class="primary-text">XTREME</span> RACE
      </h1>
      <p class="edition4-subtitle">
        Centro de operaciones digital. Sigue el padrón, la carrera en vivo y los resultados oficiales.
      </p>

      <!-- Dashboard Tab Control -->
      <div class="dashboard-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          class="tab-btn font-accent"
          :class="{ 'active': activeTab === tab.id }"
          @click="changeTab(tab.id)"
        >
          <component :is="tab.icon" :size="16" class="tab-icon" />
          <span>{{ tab.name }}</span>
        </button>
      </div>
    </header>

    <main class="container view-content-wrap">
      <!-- SUB-COMPONENTS INTERFACES -->
      <RidersPadron 
        v-if="activeTab === 'padron'" 
        :riders="ridersList" 
        class="animated-fade" 
      />

      <LeaderboardResults 
        v-if="activeTab === 'resultados'" 
        :riders="ridersList" 
        class="animated-fade" 
      />

      <!-- Sponsors List permanently rendered at the bottom of the active tab -->
      <SponsorsList class="animated-fade" />
    </main>

    <!-- Technical Info Footer -->
    <footer class="edition4-footer">
      <div class="container footer-content font-inter">
        <div>SYS_STATUS // SECURE_TELEMETRY // ONLINE</div>
        <div>Manka Riders EIRL © 2026</div>
      </div>
    </footer>

    <!-- ==========================================================================
         WS EMULATOR NOTIFICATION OVERLAYS & SIMULATOR PANEL
         ========================================================================== -->

    <!-- 1. TOAST COMPLETO DE PASO INTERMEDIO (RiderPassedCheckpoint) -->
    <Transition name="toast-slide">
      <div v-if="activeSimPassedAlert" class="ws-checkpoint-toast font-inter">
        <div class="toast-glow-strip"></div>
        <div class="toast-content">
          <div class="toast-icon-badge">
            <MapPin :size="20" class="animate-pulse text-orange" />
          </div>
          <div class="toast-info">
            <div class="toast-title font-accent">🏁 CONTROL INTERMEDIO</div>
            <div class="toast-desc">
              Placa <strong class="plate">#{{ activeSimPassedAlert.plate_number }}</strong> — {{ activeSimPassedAlert.full_name }}
            </div>
            <div class="toast-meta">
              <span>TIEMPO PARCIAL:</span>
              <strong class="time">{{ activeSimPassedAlert.elapsed_time }}</strong>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 2. OVERLAY INMERSIVO EXTREMO DE CRUCE DE META (RiderFinished) -->
    <Transition name="fade-overlay">
      <div v-if="activeSimFinishedAlert" class="ws-finished-overlay">
        <!-- Background Grid and Wipes -->
        <div class="overlay-grid-bg"></div>
        <div class="overlay-slanted-wipe"></div>
        
        <!-- Giant Podium Zoom Animation Content -->
        <div class="overlay-content">
          <!-- Glowing Aura ring -->
          <div class="glow-pulse-ring">
            <!-- Glitch / Zooming Plate Number -->
            <div class="giant-plate-number">#{{ activeSimFinishedAlert.plate_number }}</div>
          </div>

          <!-- Typewritten / Slide in metadata -->
          <div class="meta-card font-inter">
            <div class="meta-status">🏆 ¡CORREDOR EN META!</div>
            <h2 class="meta-name font-podium">{{ activeSimFinishedAlert.full_name }}</h2>
            <div class="meta-details">
              <div class="detail-box">
                <span class="lbl">CATEGORÍA</span>
                <span class="val">{{ activeSimFinishedAlert.category }}</span>
              </div>
              <div class="detail-box box-highlight">
                <span class="lbl">TIEMPO META</span>
                <span class="val">{{ activeSimFinishedAlert.net_time }}</span>
              </div>
              <div class="detail-box box-puesto-highlight">
                <span class="lbl">PUESTO</span>
                <span class="val">
                  <span class="trophy-icon">🏆</span>
                  <span>PUESTO {{ activeSimFinishedAlert.position }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 3. PANEL DE CONTROL DE SIMULACIÓN DE WEBSOCKETS -->
    <div class="floating-sim-dashboard font-inter" :class="{ 'simulating': isSimulating }">
      <div class="sim-header">
        <Zap :size="14" class="text-orange animate-pulse" />
        <span class="font-accent">WS EMULATOR PANEL</span>
        <span class="status-indicator" :class="{ 'active': isSimulating }">
          {{ isSimulating ? 'SIMULANDO...' : 'STANDBY' }}
        </span>
      </div>
      <div class="sim-actions">
        <button class="sim-btn btn-pass" @click="simulateCheckpointPass" title="Simular paso intermedio de un corredor">
          <Play :size="11" />
          <span>Paso Intermedio</span>
        </button>
        <button class="sim-btn btn-finish" @click="simulateRiderFinish" title="Simular cruce de meta con efecto extremo">
          <Award :size="11" />
          <span>Cruce de Meta</span>
        </button>
        <button class="sim-btn btn-reset" @click="resetSimulation" title="Reiniciar datos de carrera">
          <RefreshCw :size="11" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  </div>
  </div>
</template>

<style scoped>
.edition4-view-root {
  width: 100%;
  min-height: 100vh;
  background: #020202;
}

.edition4-view {
  background: #020202;
  color: #fff;
  min-height: 100vh;
  padding-top: 80px; /* Space from top */
  position: relative;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

/* Background lines */
.editorial-grid {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  pointer-events: none;
  z-index: 1;
}
.grid-col-line {
  border-right: 1px solid rgba(255, 255, 255, 0.02);
  height: 100%;
}

/* Carbon overlay */
.carbon-mesh-overlay {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(rgba(255, 94, 0, 0.02) 1.5px, transparent 1.5px), 
    radial-gradient(rgba(255, 255, 255, 0.01) 1px, transparent 1px);
  background-size: 20px 20px, 40px 40px;
  pointer-events: none;
  z-index: 1;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 10;
}

/* Exit Button Styling */
.exit-container {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 1rem;
}

.btn-exit {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  color: #fff;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.6rem 1.4rem;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 2px;
  border-radius: 100px;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.btn-exit:hover {
  background: var(--primary-color);
  color: #000;
  border-color: var(--primary-color);
  box-shadow: 0 0 15px rgba(255, 94, 0, 0.35);
  transform: translateY(-2px);
}

/* Hero section */
.edition4-hero {
  margin-bottom: 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.edition4-badge-wrap {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1.2rem;
}

.edition4-badge {
  padding: 0.3rem 0.9rem;
  background: rgba(255, 94, 0, 0.1);
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  font-family: var(--font-accent);
  font-weight: 900;
  font-size: 0.65rem;
  letter-spacing: 2.5px;
  border-radius: 100px;
}

.edition4-date {
  color: rgba(255, 255, 255, 0.45);
  font-family: var(--font-accent);
  font-weight: 800;
  font-size: 0.7rem;
  letter-spacing: 2px;
}

.edition4-title {
  font-size: clamp(2.4rem, 5vw, 4.4rem);
  font-weight: 950;
  line-height: 0.95;
  margin: 0 0 1rem 0;
  letter-spacing: -1.5px;
}

.primary-text {
  color: var(--primary-color);
}

.edition4-subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.55);
  max-width: 700px;
  margin: 0 auto 3rem;
  line-height: 1.6;
}

/* Dashboard Tab Controls */
.dashboard-tabs {
  display: flex;
  background: rgba(10, 10, 10, 0.8);
  border: 1px solid rgba(255, 94, 0, 0.25);
  padding: 0.35rem;
  border-radius: 14px;
  backdrop-filter: blur(25px);
  gap: 0.4rem;
  width: fit-content;
  margin-bottom: 1.5rem;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.8), 0 0 25px rgba(255, 94, 0, 0.08);
}

.tab-btn {
  background: transparent;
  border: 1px solid transparent;
  color: rgba(255, 255, 255, 0.6);
  padding: 0.8rem 1.8rem;
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 2px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  cursor: pointer;
  position: relative;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  text-transform: uppercase;
}

.tab-btn:hover {
  color: #fff;
  background: rgba(255, 94, 0, 0.05);
}

.tab-btn.active {
  color: #020202;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 5px 15px rgba(255, 94, 0, 0.35), 0 0 20px rgba(251, 191, 36, 0.15);
}

/* Tab Sections Animations */
.animated-fade {
  animation: tabFadeIn 0.5s ease-out;
}

@keyframes tabFadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

/* View Content wrapper */
.view-content-wrap {
  min-height: 50vh;
  flex: 1;
}

/* Telemetries info footer */
.edition4-footer {
  background: #000;
  border-top: 1px solid rgba(255, 255, 255, 0.03);
  padding: 1.5rem 0;
  margin-top: 5rem;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.25);
}

/* RESPONSIVE LAYOUT */
@media (max-width: 1024px) {
  .edition4-view {
    padding-top: 50px;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 1.2rem;
  }

  .exit-container {
    margin-bottom: 0.5rem;
  }

  .btn-exit {
    padding: 0.5rem 1rem;
    font-size: 0.65rem;
  }

  .edition4-hero {
    margin-bottom: 1.5rem;
  }

  .edition4-title {
    font-size: 2.2rem;
  }

  .edition4-subtitle {
    font-size: 0.9rem;
    margin-bottom: 2rem;
  }

  .tab-btn {
    padding: 0.6rem 1.1rem;
    font-size: 0.7rem;
    gap: 0.4rem;
  }
}

@media (max-width: 480px) {
  .dashboard-tabs {
    flex-wrap: wrap;
    justify-content: center;
    border-radius: 16px;
    padding: 0.3rem;
  }

  .tab-btn {
    flex: 1 1 40%;
    justify-content: center;
    padding: 0.5rem 0.8rem;
  }
}

/* Dynamic Ambient Background Styles */
.dynamic-ambient-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
  background: #020203;
}

.ambient-blob {
  position: absolute;
  border-radius: 50%;
  will-change: transform;
  pointer-events: none;
  opacity: 0.9;
}

.blob-orange {
  top: 5%;
  left: -15%;
  width: 700px;
  height: 700px;
  background: radial-gradient(circle, rgba(255, 94, 0, 0.22) 0%, rgba(255, 94, 0, 0.08) 50%, transparent 75%);
  animation: floatBlob1 28s ease-in-out infinite alternate;
}

.blob-yellow {
  bottom: -5%;
  right: -10%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.16) 0%, rgba(251, 191, 36, 0.05) 50%, transparent 75%);
  animation: floatBlob2 32s ease-in-out infinite alternate;
}

.blob-red {
  top: 35%;
  left: 25%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(239, 68, 68, 0.14) 0%, rgba(239, 68, 68, 0.04) 50%, transparent 75%);
  animation: floatBlob3 24s ease-in-out infinite alternate;
}

@keyframes floatBlob1 {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(8%, 12%, 0) scale(1.1); }
  100% { transform: translate3d(-4%, -5%, 0) scale(0.95); }
}

@keyframes floatBlob2 {
  0% { transform: translate3d(0, 0, 0) scale(1.05); }
  50% { transform: translate3d(-10%, -6%, 0) scale(0.95); }
  100% { transform: translate3d(6%, 8%, 0) scale(1.08); }
}

@keyframes floatBlob3 {
  0% { transform: translate3d(0, 0, 0) scale(0.95); }
  50% { transform: translate3d(6%, -12%, 0) scale(1.05); }
  100% { transform: translate3d(-8%, 6%, 0) scale(1); }
}

/* Speed lines grid scrolling overlay - GPU Optimized 2D translate, no perspective/rotateX */
.speed-lines-grid {
  position: absolute;
  inset: -80px;
  width: calc(100% + 160px);
  height: calc(100% + 160px);
  background: 
    linear-gradient(45deg, rgba(255, 94, 0, 0.008) 25%, transparent 25%), 
    linear-gradient(-45deg, rgba(255, 94, 0, 0.008) 25%, transparent 25%), 
    linear-gradient(45deg, transparent 75%, rgba(255, 94, 0, 0.008) 75%), 
    linear-gradient(-45deg, transparent 75%, rgba(255, 94, 0, 0.008) 75%);
  background-size: 80px 80px;
  animation: scrollSpeedGrid 16s linear infinite;
  will-change: transform;
}

@keyframes scrollSpeedGrid {
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    transform: translate3d(80px, 80px, 0);
  }
}

/* ==========================================================================
   WS EMULATOR NOTIFICATION STYLES
   ========================================================================== */

/* 1. Checkpoint Pass Toast */
.ws-checkpoint-toast {
  position: fixed;
  top: 90px;
  right: 24px;
  width: 320px;
  background: rgba(10, 10, 10, 0.95);
  border: 1.5px solid var(--primary-color);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 94, 0, 0.25);
  z-index: 100000;
  backdrop-filter: blur(10px);
}

.toast-glow-strip {
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  width: 100%;
}

.toast-content {
  display: flex;
  padding: 1rem;
  gap: 0.8rem;
  align-items: center;
}

.toast-icon-badge {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: rgba(255, 94, 0, 0.1);
  border: 1px solid var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
}

.toast-icon-badge span {
  font-size: 22px;
}

.toast-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.toast-title {
  font-size: 0.65rem;
  font-weight: 900;
  letter-spacing: 1.5px;
  color: var(--secondary-color);
  margin-bottom: 0.2rem;
}

.toast-desc {
  font-size: 0.82rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.2rem;
}

.toast-desc .plate {
  color: var(--primary-color);
}

.toast-meta {
  font-size: 0.7rem;
  color: #a0aec0;
}

.toast-meta .time {
  color: #ffffff;
  margin-left: 0.3rem;
  font-family: monospace;
}

/* Toast animations */
.toast-slide-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-slide-leave-active {
  transition: all 0.25s ease-in;
}
.toast-slide-enter-from {
  opacity: 0;
  transform: translateX(120%) scale(0.9);
  filter: blur(4px);
}
.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(120%) translateY(-20px);
}

/* 2. Finish Line Immersive Overlay */
.ws-finished-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 2, 2, 0.96);
  z-index: 100010;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  backdrop-filter: blur(15px);
}

.overlay-grid-bg {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(255, 94, 0, 0.015) 1.5px, transparent 1.5px), 
    linear-gradient(90deg, rgba(255, 94, 0, 0.015) 1.5px, transparent 1.5px);
  background-size: 30px 30px;
  z-index: 1;
}

.overlay-slanted-wipe {
  position: absolute;
  top: 0;
  left: 0;
  width: 140vw;
  height: 100%;
  background: radial-gradient(circle at 75% 20%, rgba(255, 94, 0, 0.18) 0%, transparent 60%),
              #0c0c0c;
  border-left: 6px solid var(--primary-color);
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.8);
  transform: skewX(-15deg);
  z-index: 2;
  animation: slideSlantedIn 0.55s cubic-bezier(0.25, 1, 0.5, 1) forwards;
}

@keyframes slideSlantedIn {
  from { transform: skewX(-15deg) translateX(120vw); opacity: 0; }
  to { transform: skewX(-15deg) translateX(-20vw); opacity: 1; }
}

.overlay-content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
  width: 100%;
  max-width: 90%;
  text-align: center;
}

.glow-pulse-ring {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulseFinishRing 2s ease-in-out infinite;
}

@keyframes pulseFinishRing {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 15px rgba(255, 94, 0, 0.3)); }
  50% { transform: scale(1.03); filter: drop-shadow(0 0 30px rgba(255, 94, 0, 0.6)); }
}

.giant-plate-number {
  font-family: 'Poppins', 'Impact', sans-serif !important;
  font-size: clamp(6rem, 18vw, 13rem);
  font-weight: 950;
  line-height: 1.1;
  padding: 10px 20px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  font-style: italic;
  transform: rotate(-4deg);
  text-shadow: 0 0 35px rgba(255, 94, 0, 0.45);
  animation: zoomPlateIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.45s forwards;
  opacity: 0;
  scale: 0.3;
}

@keyframes zoomPlateIn {
  to { opacity: 1; scale: 1; }
}

.meta-card {
  width: 100%;
  max-width: 500px;
  background: rgba(10, 10, 10, 0.85);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(15px);
  animation: slideMetaUp 0.5s cubic-bezier(0.25, 1, 0.5, 1) 0.75s forwards;
  opacity: 0;
  transform: translateY(40px);
}

@keyframes slideMetaUp {
  to { opacity: 1; transform: translateY(0); }
}

.meta-status {
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 2px;
  color: var(--primary-color);
  margin-bottom: 0.4rem;
  text-transform: uppercase;
}

.meta-name {
  font-size: clamp(1.6rem, 5vw, 2.5rem);
  font-weight: 950;
  color: #ffffff;
  margin-bottom: 1.2rem;
  text-transform: uppercase;
  letter-spacing: -1px;
}

.meta-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
}

.detail-box {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 0.75rem 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.detail-box.box-highlight {
  border-color: rgba(255, 94, 0, 0.4);
  background: rgba(255, 94, 0, 0.04);
}

.detail-box .lbl {
  font-size: 0.52rem;
  color: #a0aec0;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.detail-box .val {
  font-size: 0.9rem;
  color: #ffffff;
  font-weight: 900;
}

.box-highlight .val {
  color: var(--primary-color);
  font-size: 0.95rem;
}

/* Fade animations for overlay */
.fade-overlay-enter-active,
.fade-overlay-leave-active {
  transition: all 0.4s ease;
}
.fade-overlay-enter-from,
.fade-overlay-leave-to {
  opacity: 0;
}

/* 3. Floating Simulation Dashboard */
.floating-sim-dashboard {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 100000;
  background: rgba(8, 8, 8, 0.92);
  border: 1.5px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 0.85rem;
  width: 320px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.95), 0 0 15px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(15px);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.floating-sim-dashboard.simulating {
  border-color: rgba(255, 94, 0, 0.6);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.95), 0 0 20px rgba(255, 94, 0, 0.35);
}

.floating-sim-dashboard:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 94, 0, 0.45);
}

.sim-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1.5px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 0.5rem;
  margin-bottom: 0.6rem;
}

.sim-header .text-orange {
  color: var(--primary-color);
}

.sim-header span.font-accent {
  font-size: 0.65rem;
  font-weight: 900;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.8);
}

.status-indicator {
  margin-left: auto;
  font-size: 0.55rem;
  font-weight: 900;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  color: #a0aec0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  letter-spacing: 0.5px;
}

.status-indicator.active {
  background: rgba(255, 94, 0, 0.15);
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.sim-actions {
  display: flex;
  gap: 0.4rem;
}

.sim-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  padding: 0.45rem 0.25rem;
  font-size: 0.68rem;
  font-weight: 800;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sim-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.sim-btn.btn-pass:hover {
  border-color: #3b82f6;
  color: #60a5fa;
  background: rgba(59, 130, 246, 0.08);
}

.sim-btn.btn-finish:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: rgba(255, 94, 0, 0.08);
}

.sim-btn.btn-reset:hover {
  border-color: #ef4444;
  color: #f87171;
  background: rgba(239, 68, 68, 0.08);
}

.sim-btn:active {
  transform: scale(0.96);
}

@media (max-width: 768px) {
  .floating-sim-dashboard {
    bottom: 70px; /* Safe space from mobile bottom nav */
    right: 12px;
    left: 12px;
    width: calc(100% - 24px);
  }
}
.detail-box.box-puesto-highlight {
  border-color: rgba(251, 191, 36, 0.45) !important;
  background: rgba(251, 191, 36, 0.05) !important;
  box-shadow: 0 0 12px rgba(251, 191, 36, 0.15) !important;
}

.box-puesto-highlight .val {
  color: var(--secondary-color) !important;
  font-size: 1rem !important;
  font-weight: 950 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 0.3rem !important;
  text-shadow: 0 0 10px rgba(251, 191, 36, 0.3) !important;
}

.box-puesto-highlight .trophy-icon {
  font-size: 1.1rem !important;
  filter: drop-shadow(0 0 4px rgba(251, 191, 36, 0.5)) !important;
}

/* Performance optimization for mobile devices (Remove backdrop blur) */
@media (max-width: 768px) {
  .dashboard-tabs {
    backdrop-filter: none !important;
    background: rgba(15, 15, 15, 0.95) !important;
  }
}
</style>
