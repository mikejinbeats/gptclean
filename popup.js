/**
 * ChatGPT Clean - Popup Logic (v1.2.0)
 * Gestão de abas, temas do popup, estatísticas e envio de prompts.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Elementos do DOM
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  
  const toggleAdBlock = document.getElementById('toggle-adblock');
  const toggleExport = document.getElementById('toggle-export');
  const toggleFolders = document.getElementById('toggle-folders');
  const themeRadios = document.querySelectorAll('input[name="theme-radio"]');

  const statToday = document.getElementById('stat-today');
  const statTotal = document.getElementById('stat-total');
  
  const statusBadge = document.getElementById('status-badge');
  const statusText = document.getElementById('status-text');

  const btnUpdateFilters = document.getElementById('btn-update-filters');
  const updateBtnText = document.getElementById('update-btn-text');

  const popupPromptsList = document.getElementById('popup-prompts-list');
  const goToProFromPrompts = document.getElementById('go-to-pro-from-prompts');
  const promptsProLock = document.getElementById('prompts-pro-lock');

  const exportTrialBadge = document.getElementById('export-trial-badge');
  const trialFooterStatus = document.getElementById('trial-footer-status');

  const licenseInput = document.getElementById('license-key-input');
  const btnActivateLicense = document.getElementById('btn-activate-license');
  const licenseMsg = document.getElementById('license-msg');
  const pricingBox = document.getElementById('pricing-box');

  const langDropdown = document.getElementById('custom-lang-dropdown');
  const langDropdownBtn = document.getElementById('lang-dropdown-btn');
  const langBtnFlag = document.getElementById('lang-btn-flag');
  const langBtnCode = document.getElementById('lang-btn-code');

  let currentExportsRemaining = 2;
  let isCurrentPro = false;

  // --------------------------------------------------------------------------
  // BANDEIRAS VIVAS EM SVG PARA OS 8 PAÍSES (RENDERIZAÇÃO NATIVA PERFEITA)
  // --------------------------------------------------------------------------
  const FLAGS_SVG = {
    en: `<svg viewBox="0 0 20 14" width="16" height="11" style="border-radius:2px;display:inline-block;vertical-align:middle;box-shadow:0 1px 2px rgba(0,0,0,0.25);"><rect width="20" height="14" fill="#012169"/><path d="M0,0 L20,14 M20,0 L0,14" stroke="#ffffff" stroke-width="2.6"/><path d="M0,0 L20,14 M20,0 L0,14" stroke="#c8102e" stroke-width="1.2"/><path d="M10,0 V14 M0,7 H20" stroke="#ffffff" stroke-width="4.4"/><path d="M10,0 V14 M0,7 H20" stroke="#c8102e" stroke-width="2.4"/></svg>`,
    pt: `<svg viewBox="0 0 20 14" width="16" height="11" style="border-radius:2px;display:inline-block;vertical-align:middle;box-shadow:0 1px 2px rgba(0,0,0,0.25);"><rect width="8" height="14" fill="#006600"/><rect x="8" width="12" height="14" fill="#ff0000"/><circle cx="8" cy="7" r="3" fill="#ffcc00"/><circle cx="8" cy="7" r="2" fill="#ffffff"/><rect x="7" y="5" width="2" height="4" fill="#003399"/></svg>`,
    es: `<svg viewBox="0 0 20 14" width="16" height="11" style="border-radius:2px;display:inline-block;vertical-align:middle;box-shadow:0 1px 2px rgba(0,0,0,0.25);"><rect width="20" height="3.5" fill="#aa151b"/><rect y="3.5" width="20" height="7" fill="#f1bf00"/><rect y="10.5" width="20" height="3.5" fill="#aa151b"/><rect x="3.5" y="5.5" width="2" height="3" fill="#aa151b"/></svg>`,
    fr: `<svg viewBox="0 0 20 14" width="16" height="11" style="border-radius:2px;display:inline-block;vertical-align:middle;box-shadow:0 1px 2px rgba(0,0,0,0.25);"><rect width="6.6" height="14" fill="#002395"/><rect x="6.6" width="6.8" height="14" fill="#ffffff"/><rect x="13.4" width="6.6" height="14" fill="#ed2939"/></svg>`,
    de: `<svg viewBox="0 0 20 14" width="16" height="11" style="border-radius:2px;display:inline-block;vertical-align:middle;box-shadow:0 1px 2px rgba(0,0,0,0.25);"><rect width="20" height="4.6" fill="#000000"/><rect y="4.6" width="20" height="4.8" fill="#dd0000"/><rect y="9.4" width="20" height="4.6" fill="#ffce00"/></svg>`,
    it: `<svg viewBox="0 0 20 14" width="16" height="11" style="border-radius:2px;display:inline-block;vertical-align:middle;box-shadow:0 1px 2px rgba(0,0,0,0.25);"><rect width="6.6" height="14" fill="#009246"/><rect x="6.6" width="6.8" height="14" fill="#ffffff"/><rect x="13.4" width="6.6" height="14" fill="#ce2b37"/></svg>`,
    zh: `<svg viewBox="0 0 20 14" width="16" height="11" style="border-radius:2px;display:inline-block;vertical-align:middle;box-shadow:0 1px 2px rgba(0,0,0,0.25);"><rect width="20" height="14" fill="#de2910"/><polygon points="4.5,2 5.5,4.5 3,3 6,3 3.5,4.5" fill="#ffde00"/><circle cx="8" cy="2" r="0.6" fill="#ffde00"/><circle cx="9.2" cy="3.5" r="0.6" fill="#ffde00"/><circle cx="9.2" cy="5.5" r="0.6" fill="#ffde00"/><circle cx="8" cy="7" r="0.6" fill="#ffde00"/></svg>`,
    ja: `<svg viewBox="0 0 20 14" width="16" height="11" style="border-radius:2px;display:inline-block;vertical-align:middle;box-shadow:0 1px 2px rgba(0,0,0,0.25);"><rect width="20" height="14" fill="#ffffff"/><circle cx="10" cy="7" r="4" fill="#bc002d"/></svg>`
  };

  // Inicializar ícones de bandeiras no menu
  document.querySelectorAll('.flag-svg-icon[data-flag]').forEach(el => {
    const flagKey = el.getAttribute('data-flag');
    if (FLAGS_SVG[flagKey]) {
      el.innerHTML = FLAGS_SVG[flagKey];
    }
  });

  // --------------------------------------------------------------------------
  // DICIONÁRIO DE INTERNACIONALIZAÇÃO (8 IDIOMAS MAIS FALADOS)
  // --------------------------------------------------------------------------
  const I18N = {
    pt: {
    footerProText: "Modo PRO Ativo",
      statusProtected: "Protegido",
      statusDisabled: "Desativado",
      tabShield: "ESCUDO",
      tabPrompts: "PROMPTS",
      tabTools: "FERRAMENTAS",
      tabPro: "PRO",
      blockAdsTitle: "Bloquear Anúncios",
      blockAdsDesc: "Elimina conteúdo patrocinado em tempo real",
      statsTitle: "TELEMETRIA",
      btnResetStats: "Zerar",
      statsResetSuccess: "Zerado!",
      statTodayLabel: "BLOQUEADOS HOJE",
      statTotalLabel: "TOTAL ACUMULADO",
      btnUpdateFilters: "Atualizar Filtros Anti-Ad",
      updatingFilters: "A verificar...",
      updatedFilters: "Filtros Atualizados!",
      shieldInfoDesc: "O escudo monitoriza o DOM do ChatGPT e destrói anúncios antes de serem renderizados.",
      promptsTitle: "Prompts de Produtividade",
      promptsCount: "3 Prontos",
      promptsHint: "Clica para injetar instantaneamente no chat ativo:",
      newPromptHeader: "✨ Novo Prompt Personalizado",
      promptTitlePlaceholder: "Título (ex: Copy de Vendas)",
      promptDescPlaceholder: "Descrição curta (opcional)",
      promptTextPlaceholder: "Escreve aqui o comando completo do prompt...",
      btnSavePrompt: "Guardar Prompt",
      btnCancelPrompt: "Cancelar",
      btnOpenPromptForm: "✨ + Criar Novo Prompt PRO",
      lockTitle: "Adicionar Prompts Ilimitados",
      lockDesc: "Guarda a tua biblioteca de comandos na versão PRO.",
      themeTitle: "Tema Visual do Menu",
      themeDesc: "Personaliza a estética da extensão:",
      themeDark: "Escuro",
      themeWhite: "Branco",
      themePurple: "Roxo",
      exportMenuTitle: "Menu de Exportação",
      exportMenuDesc: "Exportação em PDF, Word (.doc) e Markdown (.md)",
      exportQuotaBadge: (rem) => `🎁 ${rem}/2 hoje`,
      exportQuotaBadgePro: "👑 PRO Vitalício",
      foldersTitle: "Pastas na Barra Lateral",
      badgeFoldersActive: "Ativo",
      foldersDesc: "Organiza e guarda chats favoritos em categorias",
      proHeroTitle: "ChatGPT Clean PRO",
      proHeroDesc: "Desbloqueia todo o ecossistema com licença única vitalícia.",
      proB1: "<strong>Exportações 100% Ilimitadas</strong> (Sem limite de 2 por dia)",
      proB2: "<strong>Pastas & Marcadores ilimitados</strong> na barra lateral",
      proB3: "<strong>Biblioteca pessoal</strong> de prompts personalizados",
      proB4: "<strong>Atualizações prioritárias</strong> de filtros anti-anúncio",
      proSinglePay: "Pagamento Único",
      btnBuyPro: "Desbloquear Modo PRO (2,99€)",
      proLicenseLabel: "Já tens uma chave de licença?",
      btnActivateLicense: "Ativar",
      proActiveSuccess: "Licença PRO Ativa para Sempre",
      proRegisteredTitle: "Licença Vitalícia Registada",
      proRegisteredSubtitle: "A tua conta ChatGPT Clean PRO está ativa para sempre. Exportações 100% ilimitadas, pastas infinitas e atualizações prioritárias desbloqueadas.",
      proRegisteredBadge: "Ativo • Vitalício",
      footerLink: "Abrir ChatGPT",
      footerQuota: (rem) => `Exportações: ${rem}/2 hoje`,
      footerPro: "👑 Modo PRO Ativo",
      btnInsert: "Inserir no Chat",
      btnCopy: "Copiar",
      copied: "Copiado!",
      inserted: "Inserido!",
      prompts: [
        {
          title: "Resumir em Bullet Points",
          desc: "Transforma textos longos em tópicos diretos e objetivos.",
          text: "Por favor, resume o texto anterior em tópicos claros, diretos e objetivos (bullet points), destacando apenas os pontos mais importantes."
        },
        {
          title: "Melhorar e Corrigir Texto",
          desc: "Aprimora a gramática, tom profissional e clareza.",
          text: "Revê e melhora o seguinte texto, corrigindo erros gramaticais e tornando a linguagem mais fluida e profissional:\n\n"
        },
        {
          title: "Explicar Código Passo a Passo",
          desc: "Comenta linha por linha e sugere otimizações.",
          text: "Analisa o código abaixo e explica linha por linha como funciona, apontando possíveis melhorias ou bugs:\n\n"
        }
      ]
    },
    en: {
    footerProText: "PRO Mode Active",
      statusProtected: "Protected",
      statusDisabled: "Disabled",
      tabShield: "SHIELD",
      tabPrompts: "PROMPTS",
      tabTools: "TOOLS",
      tabPro: "PRO",
      blockAdsTitle: "Block Ads",
      blockAdsDesc: "Eliminate sponsored and ad content in real-time",
      statsTitle: "TELEMETRY",
      btnResetStats: "Reset",
      statsResetSuccess: "Reset!",
      statTodayLabel: "BLOCKED TODAY",
      statTotalLabel: "TOTAL ALL-TIME",
      btnUpdateFilters: "Update Anti-Ad Filters",
      updatingFilters: "Checking...",
      updatedFilters: "Filters Updated!",
      shieldInfoDesc: "The shield monitors ChatGPT's DOM and removes ads before they are rendered.",
      promptsTitle: "Productivity Prompts",
      promptsCount: "3 Ready",
      promptsHint: "Click to instantly insert into active chat:",
      newPromptHeader: "✨ New Custom Prompt",
      promptTitlePlaceholder: "Title (e.g. Sales Copy)",
      promptDescPlaceholder: "Short description (optional)",
      promptTextPlaceholder: "Type your full prompt command here...",
      btnSavePrompt: "Save Prompt",
      btnCancelPrompt: "Cancel",
      btnOpenPromptForm: "✨ + Create New PRO Prompt",
      lockTitle: "Add Unlimited Prompts",
      lockDesc: "Store your custom prompt library in PRO version.",
      themeTitle: "Visual Themes",
      themeDesc: "Customize extension aesthetics:",
      themeDark: "Dark",
      themeWhite: "White",
      themePurple: "Purple",
      exportMenuTitle: "Export Menu",
      exportMenuDesc: "Export to PDF, Word (.doc) and Markdown (.md)",
      exportQuotaBadge: (rem) => `🎁 ${rem}/2 today`,
      exportQuotaBadgePro: "👑 Lifetime PRO",
      foldersTitle: "Sidebar Folders",
      badgeFoldersActive: "Active",
      foldersDesc: "Organize and bookmark favorite chats in categories",
      proHeroTitle: "ChatGPT Clean PRO",
      proHeroDesc: "Unlock the entire suite with a single lifetime license.",
      proB1: "<strong>100% Unlimited Exports</strong> (No 2/day daily limit)",
      proB2: "<strong>Unlimited Folders & Bookmarks</strong> in sidebar",
      proB3: "<strong>Personal Custom Prompt Library</strong>",
      proB4: "<strong>Priority Anti-Ad Filter Updates</strong>",
      proSinglePay: "One-Time Payment",
      btnBuyPro: "Unlock PRO Mode ($2.99)",
      proLicenseLabel: "Already have a license key?",
      btnActivateLicense: "Activate",
      proActiveSuccess: "Lifetime PRO License Active",
      proRegisteredTitle: "Lifetime License Registered",
      proRegisteredSubtitle: "Your ChatGPT Clean PRO account is permanently active for life. 100% unlimited exports, infinite sidebar folders, and priority filter updates are unlocked.",
      proRegisteredBadge: "Active • Lifetime",
      footerLink: "Open ChatGPT",
      footerQuota: (rem) => `Exports: ${rem}/2 today`,
      footerPro: "👑 PRO Mode Active",
      btnInsert: "Insert in Chat",
      btnCopy: "Copy",
      copied: "Copied!",
      inserted: "Inserted!",
      prompts: [
        {
          title: "Summarize in Bullet Points",
          desc: "Transforms long texts into clear, direct key takeaways.",
          text: "Please summarize the preceding text into clear, concise, and objective bullet points highlighting only the most important insights."
        },
        {
          title: "Improve & Fix Grammar",
          desc: "Enhances grammar, professional tone, and flow.",
          text: "Please review and enhance the following text, correcting grammar mistakes and improving clarity and professionalism while preserving its core meaning:\n\n"
        },
        {
          title: "Explain Code Step-by-Step",
          desc: "Explains line-by-line and suggests optimizations.",
          text: "Analyze the code below. Explain step-by-step how it works, highlight potential edge cases or bugs, and propose clean code improvements:\n\n"
        }
      ]
    },
    es: {
    footerProText: "Modo PRO Activo",
      statusProtected: "Protegido",
      statusDisabled: "Desactivado",
      tabShield: "ESCUDO",
      tabPrompts: "PROMPTS",
      tabTools: "HERRAMIENTAS",
      tabPro: "PRO",
      blockAdsTitle: "Bloquear Anuncios",
      blockAdsDesc: "Elimina contenido patrocinado en tiempo real",
      statsTitle: "TELEMETRÍA",
      btnResetStats: "Reiniciar",
      statsResetSuccess: "✅ ¡Reiniciado!",
      statTodayLabel: "BLOQUEADOS HOY",
      statTotalLabel: "TOTAL HISTÓRICO",
      btnUpdateFilters: "Actualizar Filtros Anti-Ad",
      updatingFilters: "Comprobando...",
      updatedFilters: "✅ ¡Filtros Actualizados!",
      shieldInfoDesc: "El escudo monitoriza el DOM de ChatGPT y elimina la publicidad al instante.",
      promptsTitle: "Prompts de Productividad",
      promptsCount: "3 Listos",
      promptsHint: "Haz clic para insertar al instante en el chat:",
      newPromptHeader: "✨ Nuevo Prompt Personalizado",
      promptTitlePlaceholder: "Título (ej: Copy de Ventas)",
      promptDescPlaceholder: "Descripción corta (opcional)",
      promptTextPlaceholder: "Escribe aquí la instrucción completa del prompt...",
      btnSavePrompt: "Guardar Prompt",
      btnCancelPrompt: "Cancelar",
      btnOpenPromptForm: "✨ + Crear Nuevo Prompt PRO",
      lockTitle: "Añadir Prompts Ilimitados",
      lockDesc: "Guarda tu biblioteca de comandos en la versión PRO.",
      themeTitle: "Tema Visual del Menú",
      themeDesc: "Personaliza la estética de la extensión:",
      themeDark: "Oscuro",
      themeWhite: "Blanco",
      themePurple: "Morado",
      exportMenuTitle: "Menú de Exportación",
      exportMenuDesc: "Exportación a PDF, Word (.doc) y Markdown (.md)",
      exportQuotaBadge: (rem) => `🎁 ${rem}/2 hoy`,
      exportQuotaBadgePro: "👑 PRO Vitalicio",
      foldersTitle: "Carpetas en la Barra Lateral",
      badgeFoldersActive: "Activo",
      foldersDesc: "Organiza y guarda chats favoritos en categorías",
      proHeroTitle: "ChatGPT Clean PRO",
      proHeroDesc: "Desbloquea todo el ecosistema con licencia única de por vida.",
      proB1: "<strong>Exportaciones 100% Ilimitadas</strong> (Sin límite de 2 al día)",
      proB2: "<strong>Carpetas y Marcadores ilimitados</strong>",
      proB3: "<strong>Biblioteca personal</strong> de prompts",
      proB4: "<strong>Actualizaciones prioritarias</strong> de filtros",
      proSinglePay: "Pago Único",
      btnBuyPro: "Desbloquear Modo PRO (2,99€)",
      proLicenseLabel: "¿Ya tienes una clave de licencia?",
      btnActivateLicense: "Activar",
      proActiveSuccess: "Licencia PRO Activa de por Vida",
      proRegisteredTitle: "Licencia de por Vida Registrada",
      proRegisteredSubtitle: "Tu cuenta ChatGPT Clean PRO está activa para siempre. Exportaciones 100% ilimitadas, carpetas infinitas y actualizaciones prioritarias desbloqueadas.",
      proRegisteredBadge: "Activo • Vitalicio",
      footerLink: "Abrir ChatGPT",
      footerQuota: (rem) => `Exportaciones: ${rem}/2 hoy`,
      footerPro: "👑 Modo PRO Activo",
      btnInsert: "Insertar en Chat",
      btnCopy: "Copiar",
      copied: "✅ ¡Copiado!",
      inserted: "✅ ¡Insertado!",
      prompts: [
        {
          title: "Resumir en Viñetas",
          desc: "Transforma textos largos en puntos claros y directos.",
          text: "Por favor, resume el texto anterior en viñetas claras, directas y objetivas con los puntos clave más importantes."
        },
        {
          title: "Mejorar y Corregir Texto",
          desc: "Perfecciona la gramática, tono profesional y fluidez.",
          text: "Revisa y mejora el siguiente texto, corrigiendo errores gramaticales y haciendo el lenguaje más fluido y profesional:\n\n"
        },
        {
          title: "Explicar Código Paso a Paso",
          desc: "Comenta línea por línea y sugiere optimizaciones.",
          text: "Analiza el siguiente código y explica línea por línea cómo funciona, señalando posibles fallos o mejoras:\n\n"
        }
      ]
    },
    fr: {
    footerProText: "Mode PRO Actif",
      statusProtected: "Protégé",
      statusDisabled: "Désactivé",
      tabShield: "BOUCLIER",
      tabPrompts: "PROMPTS",
      tabTools: "OUTILS",
      tabPro: "PRO",
      blockAdsTitle: "Bloquer les Pubs",
      blockAdsDesc: "Supprime le contenu sponsorisé en temps réel",
      statsTitle: "TÉLÉMÉTRIE",
      btnResetStats: "Reset",
      statsResetSuccess: "Réinitialisé !",
      statTodayLabel: "BLOQUÉS AUJOURD'HUI",
      statTotalLabel: "TOTAL HISTORIQUE",
      btnUpdateFilters: "Mettre à jour les Filtres",
      updatingFilters: "Vérification...",
      updatedFilters: "Filtres Mis à Jour !",
      shieldInfoDesc: "Le bouclier surveille le DOM de ChatGPT et neutralise les publicités.",
      promptsTitle: "Prompts de Productivité",
      promptsCount: "3 Prêts",
      promptsHint: "Cliquez pour insérer directement dans la discussion :",
      newPromptHeader: "✨ Nouveau Prompt Personnalisé",
      promptTitlePlaceholder: "Titre (ex. Copywriting Vente)",
      promptDescPlaceholder: "Courte description (optionnelle)",
      promptTextPlaceholder: "Écrivez la commande complète ici...",
      btnSavePrompt: "Enregistrer le Prompt",
      btnCancelPrompt: "Annuler",
      btnOpenPromptForm: "✨ + Créer un Nouveau Prompt PRO",
      lockTitle: "Ajouter des Prompts Illimités",
      lockDesc: "Conservez votre bibliothèque de commandes dans la version PRO.",
      themeTitle: "Thème Visuel",
      themeDesc: "Personnalisez l'esthétique de l'extension :",
      themeDark: "Sombre",
      themeWhite: "Blanc",
      themePurple: "Violet",
      exportMenuTitle: "Menu d'Exportation",
      exportMenuDesc: "Export au format PDF, Word (.doc) et Markdown (.md)",
      exportQuotaBadge: (rem) => `🎁 ${rem}/2 auj.`,
      exportQuotaBadgePro: "👑 PRO À Vie",
      foldersTitle: "Dossiers dans la Barre Latérale",
      badgeFoldersActive: "Actif",
      foldersDesc: "Organisez et épinglez vos conversations préférées",
      proHeroTitle: "ChatGPT Clean PRO",
      proHeroDesc: "Débloquez tout l'écosystème avec une licence unique à vie.",
      proB1: "<strong>Exports 100% Illimités</strong> (Sans limite quotidienne de 2/jour)",
      proB2: "<strong>Dossiers & Favoris illimités</strong> dans la barre latérale",
      proB3: "<strong>Bibliothèque personnelle</strong> de prompts",
      proB4: "<strong>Mises à jour prioritaires</strong> des filtres",
      proSinglePay: "Paiement Unique",
      btnBuyPro: "Débloquer le Mode PRO (2,99€)",
      proLicenseLabel: "Vous avez déjà une clé de licence ?",
      btnActivateLicense: "Activer",
      proActiveSuccess: "Licence PRO Active à Vie",
      proRegisteredTitle: "Licence à Vie Enregistrée",
      proRegisteredSubtitle: "Votre compte ChatGPT Clean PRO est actif pour toujours. Exports 100% illimités, dossiers infinis et mises à jour prioritaires débloqués.",
      proRegisteredBadge: "Actif • À Vie",
      footerLink: "Ouvrir ChatGPT",
      footerQuota: (rem) => `Exports : ${rem}/2 auj.`,
      footerPro: "👑 Mode PRO Actif",
      btnInsert: "Insérer au Chat",
      btnCopy: "Copier",
      copied: "Copié !",
      inserted: "Inséré !",
      prompts: [
        {
          title: "Résumer en Puces",
          desc: "Transforme les longs textes en points clairs et précis.",
          text: "Veuillez résumer le texte précédent sous forme de puces claires, directes et concises avec les points essentiels."
        },
        {
          title: "Améliorer et Corriger le Texte",
          desc: "Perfectionne la grammaire, la clarté et le ton professionnel.",
          text: "Veuillez relire et améliorer le texte suivant, en corrigeant les fautes et en renforçant le professionnalisme :\n\n"
        },
        {
          title: "Expliquer le Code Pas à Pas",
          desc: "Explication détaillée ligne par ligne et optimisation.",
          text: "Analysez le code ci-dessous et expliquez son fonctionnement étape par étape, en signalant les bogues potentiels :\n\n"
        }
      ]
    },
    de: {
    footerProText: "PRO-Modus Aktiv",
      statusProtected: "Geschützt",
      statusDisabled: "Deaktiviert",
      tabShield: "SCHUTZ",
      tabPrompts: "PROMPTS",
      tabTools: "WERKZEUGE",
      tabPro: "PRO",
      blockAdsTitle: "Werbung Blockieren",
      blockAdsDesc: "Entfernt gesponserte Inhalte in Echtzeit",
      statsTitle: "TELEMETRIE",
      btnResetStats: "Reset",
      statsResetSuccess: "Zurückgesetzt!",
      statTodayLabel: "HEUTE BLOCKIERT",
      statTotalLabel: "GESAMT BLOCKIERT",
      btnUpdateFilters: "Anti-Ad Filter Aktualisieren",
      updatingFilters: "Wird geprüft...",
      updatedFilters: "Filter Aktualisiert!",
      shieldInfoDesc: "Das Schild überwacht das ChatGPT-DOM und entfernt Werbung sofort.",
      promptsTitle: "Produktivitäts-Prompts",
      promptsCount: "3 Bereit",
      promptsHint: "Klicken zum direkten Einfügen in den Chat:",
      newPromptHeader: "✨ Neuer Eigener Prompt",
      promptTitlePlaceholder: "Titel (z.B. Verkaufs-Copy)",
      promptDescPlaceholder: "Kurzbeschreibung (optional)",
      promptTextPlaceholder: "Geben Sie hier den vollständigen Befehl ein...",
      btnSavePrompt: "Prompt Speichern",
      btnCancelPrompt: "Abbrechen",
      btnOpenPromptForm: "✨ + Neuen PRO-Prompt Erstellen",
      lockTitle: "Unbegrenzte Prompts Hinzufügen",
      lockDesc: "Speichern Sie Ihre persönliche Befehlsbibliothek im PRO-Modus.",
      themeTitle: "Visuelles Design",
      themeDesc: "Passen Sie die Ästhetik der Erweiterung an:",
      themeDark: "Dunkel",
      themeWhite: "Weiß",
      themePurple: "Lila",
      exportMenuTitle: "Export-Menü",
      exportMenuDesc: "Export als PDF, Word (.doc) und Markdown (.md)",
      exportQuotaBadge: (rem) => `🎁 ${rem}/2 heute`,
      exportQuotaBadgePro: "👑 Lifetime PRO",
      foldersTitle: "Seitenleisten-Ordner",
      badgeFoldersActive: "Aktiv",
      foldersDesc: "Organisieren Sie Ihre Lieblingschats in Kategorien",
      proHeroTitle: "ChatGPT Clean PRO",
      proHeroDesc: "Schalten Sie alle Funktionen mit einer lebenslangen Lizenz frei.",
      proB1: "<strong>100% Unbegrenzte Exporte</strong> (Kein 2/Tag Limit)",
      proB2: "<strong>Unbegrenzte Ordner & Lesezeichen</strong> in der Seitenleiste",
      proB3: "<strong>Eigene Prompt-Bibliothek</strong>",
      proB4: "<strong>Priorisierte Werbefilter-Updates</strong>",
      proSinglePay: "Einmalzahlung",
      btnBuyPro: "PRO-Modus Freischalten (2,99€)",
      proLicenseLabel: "Haben Sie bereits einen Lizenzschlüssel?",
      btnActivateLicense: "Aktivieren",
      proActiveSuccess: "Lifetime PRO-Lizenz Aktiv",
      proRegisteredTitle: "Lebenslange Lizenz Registriert",
      proRegisteredSubtitle: "Ihr ChatGPT Clean PRO-Konto ist dauerhaft aktiv. 100% unbegrenzte Exporte, unendliche Seitenleisten-Ordner und priorisierte Filter-Updates freigeschaltet.",
      proRegisteredBadge: "Aktiv • Lebenslang",
      footerLink: "ChatGPT Öffnen",
      footerQuota: (rem) => `Exporte: ${rem}/2 heute`,
      footerPro: "👑 PRO-Modus Aktiv",
      btnInsert: "In Chat Einfügen",
      btnCopy: "Kopieren",
      copied: "Kopiert!",
      inserted: "Eingefügt!",
      prompts: [
        {
          title: "In Stichpunkten Zusammenfassen",
          desc: "Wandelt lange Texte in prägnante Kernpunkte um.",
          text: "Bitte fasse den vorherigen Text in klaren, prägnanten und objektiven Stichpunkten mit den wichtigsten Kernaussagen zusammen."
        },
        {
          title: "Text Optimieren & Korrigieren",
          desc: "Verbessert Grammatik, Ausdruck und professionellen Ton.",
          text: "Bitte überprüfe und optimiere den folgenden Text, korrigiere Grammatikfehler und verbessere Klarheit und Ausdruck:\n\n"
        },
        {
          title: "Code Schritt für Schritt Erklären",
          desc: "Erklärt Zeile für Zeile und schlägt Optimierungen vor.",
          text: "Analysiere den folgenden Code und erkläre Schritt für Schritt die Funktionsweise, weise auf Fehler hin und schlage Optimierungen vor:\n\n"
        }
      ]
    },
    it: {
    footerProText: "Modalità PRO Attiva",
      statusProtected: "Protetto",
      statusDisabled: "Disattivato",
      tabShield: "SCUDO",
      tabPrompts: "PROMPTS",
      tabTools: "STRUMENTI",
      tabPro: "PRO",
      blockAdsTitle: "Blocca Pubblicità",
      blockAdsDesc: "Rimuove contenuti sponsorizzati in tempo reale",
      statsTitle: "TELEMETRIA",
      btnResetStats: "Azzera",
      statsResetSuccess: "✅ Azzerato!",
      statTodayLabel: "BLOCCATI OGGI",
      statTotalLabel: "TOTALE STORICO",
      btnUpdateFilters: "Aggiorna Filtri Anti-Ad",
      updatingFilters: "Verifica...",
      updatedFilters: "✅ Filtri Aggiornati!",
      shieldInfoDesc: "Lo scudo monitora il DOM di ChatGPT e rimuove le pubblicità istantaneamente.",
      promptsTitle: "Prompt di Produttività",
      promptsCount: "3 Pronti",
      promptsHint: "Clicca per inserire istantaneamente nella chat attiva:",
      newPromptHeader: "✨ Nuovo Prompt Personalizzato",
      promptTitlePlaceholder: "Titolo (es: Copy di Vendita)",
      promptDescPlaceholder: "Breve descrizione (opzionale)",
      promptTextPlaceholder: "Scrivi qui il comando completo del prompt...",
      btnSavePrompt: "Salva Prompt",
      btnCancelPrompt: "Annulla",
      btnOpenPromptForm: "✨ + Crea Nuovo Prompt PRO",
      lockTitle: "Aggiungi Prompt Illimitati",
      lockDesc: "Salva la tua libreria di comandi nella versione PRO.",
      themeTitle: "Tema Visivo del Menu",
      themeDesc: "Personalizza l'estetica dell'estensione:",
      themeDark: "Scuro",
      themeWhite: "Bianco",
      themePurple: "Viola",
      exportMenuTitle: "Menu di Esportazione",
      exportMenuDesc: "Esportazione in PDF, Word (.doc) e Markdown (.md)",
      exportQuotaBadge: (rem) => `🎁 ${rem}/2 oggi`,
      exportQuotaBadgePro: "👑 PRO a Vita",
      foldersTitle: "Cartelle nella Barra Laterale",
      badgeFoldersActive: "Attivo",
      foldersDesc: "Organizza e salva le tue chat preferite in categorie",
      proHeroTitle: "ChatGPT Clean PRO",
      proHeroDesc: "Sblocca l'intero ecosistema con una licenza unica a vita.",
      proB1: "<strong>Esportazioni 100% Illimitate</strong> (Nessun limite di 2 al giorno)",
      proB2: "<strong>Cartelle e Segnalibri illimitati</strong> nella barra laterale",
      proB3: "<strong>Libreria personale</strong> di prompt personalizzati",
      proB4: "<strong>Aggiornamenti prioritari</strong> dei filtri anti-annunci",
      proSinglePay: "Pagamento Singolo",
      btnBuyPro: "Sblocca Modalità PRO (2,99€)",
      proLicenseLabel: "Hai già una chiave di licenza?",
      btnActivateLicense: "Attiva",
      proActiveSuccess: "Licenza PRO Attiva a Vita",
      proRegisteredTitle: "Licenza a Vita Registrata",
      proRegisteredSubtitle: "Il tuo account ChatGPT Clean PRO è attivo per sempre. Esportazioni 100% illimitate, cartelle infinite e aggiornamenti prioritari sbloccati.",
      proRegisteredBadge: "Attivo • A Vita",
      footerLink: "Apri ChatGPT",
      footerQuota: (rem) => `Esportazioni: ${rem}/2 hoje`,
      footerPro: "👑 Modalità PRO Attiva",
      btnInsert: "Inserisci in Chat",
      btnCopy: "Copia",
      copied: "✅ Copiato!",
      inserted: "✅ Inserito!",
      prompts: [
        {
          title: "Riassumi in Punti Elenco",
          desc: "Trasforma testi lunghi in punti chiari ed essenziali.",
          text: "Per favore, riassumi il testo precedente in punti elenco chiari, diretti e concisi con le informazioni più importanti."
        },
        {
          title: "Migliora e Correggi Testo",
          desc: "Perfeziona la grammatica, la chiarezza e il tono professionale.",
          text: "Rivedi e migliora il seguente testo, correggendo errori grammaticali e rendendolo più chiaro e professionale:\n\n"
        },
        {
          title: "Spiega il Codice Passo dopo Passo",
          desc: "Spiegazione riga per riga e ottimizzazione.",
          text: "Analizza il codice seguente e spiega riga per riga il suo funzionamento, indicando possibili bug o miglioramenti:\n\n"
        }
      ]
    },
    zh: {
    footerProText: "PRO 专业版已激活",
      statusProtected: "已受保护",
      statusDisabled: "已停用",
      tabShield: "防护盾",
      tabPrompts: "提示词",
      tabTools: "工具箱",
      tabPro: "专业版",
      blockAdsTitle: "广告拦截",
      blockAdsDesc: "实时清除ChatGPT所有赞助推广内容",
      statsTitle: "实时统计",
      btnResetStats: "重置",
      statsResetSuccess: "已重置！",
      statTodayLabel: "今日已拦截",
      statTotalLabel: "历史总计拦截",
      btnUpdateFilters: "更新广告过滤规则",
      updatingFilters: "检查中...",
      updatedFilters: "规则已更新！",
      shieldInfoDesc: "防护盾实时监控ChatGPT DOM结构并在广告渲染前直接消除。",
      promptsTitle: "高效生产力提示词",
      promptsCount: "3个内置",
      promptsHint: "点击即可一键插入当前聊天输入框：",
      newPromptHeader: "✨ 新建自定义提示词",
      promptTitlePlaceholder: "标题（例：爆款营销文案）",
      promptDescPlaceholder: "简要说明（选填）",
      promptTextPlaceholder: "在此输入完整的提示词指令...",
      btnSavePrompt: "保存提示词",
      btnCancelPrompt: "取消",
      btnOpenPromptForm: "✨ + 创建PRO自定义提示词",
      lockTitle: "解锁无限自定义提示词",
      lockDesc: "升级PRO专业版，随时随地保存海量专属指令库。",
      themeTitle: "界面视觉主题",
      themeDesc: "自定义扩展面板设计风格：",
      themeDark: "深色",
      themeWhite: "浅色",
      themePurple: "紫色",
      exportMenuTitle: "对话导出菜单",
      exportMenuDesc: "支持导出为 PDF、Word (.doc) 与 Markdown (.md)",
      exportQuotaBadge: (rem) => `🎁 今日剩余: ${rem}/2`,
      exportQuotaBadgePro: "👑 终身PRO",
      foldersTitle: "侧边栏分类文件夹",
      badgeFoldersActive: "已启用",
      foldersDesc: "轻松管理、归档并一键收藏常用聊天对话",
      proHeroTitle: "ChatGPT Clean PRO",
      proHeroDesc: "一次购买，终身享受全部高级生态功能与无限制体验。",
      proB1: "<strong>100% 无限导出</strong>（无每日2次额度限制）",
      proB2: "<strong>无限侧边栏文件夹与书签</strong>",
      proB3: "<strong>专属自定义提示词库</strong>",
      proB4: "<strong>广告过滤规则优先极速更新</strong>",
      proSinglePay: "一次性买断",
      btnBuyPro: "解锁PRO专业版 (2.99€)",
      proLicenseLabel: "已有授权激活密钥？",
      btnActivateLicense: "立即激活",
      proActiveSuccess: "终身PRO授权已永久激活",
      proRegisteredTitle: "终身PRO授权已永久激活",
      proRegisteredSubtitle: "您的 ChatGPT Clean PRO 账户已永久生效。享受100%无限次全格式导出、无限侧边栏文件夹管理及广告过滤规则极速更新特权。",
      proRegisteredBadge: "已激活 • 永久生效",
      footerLink: "打开 ChatGPT",
      footerQuota: (rem) => `今日导出: ${rem}/2`,
      footerPro: "👑 PRO专业版已激活",
      btnInsert: "插入聊天",
      btnCopy: "复制",
      copied: "已复制！",
      inserted: "已插入！",
      prompts: [
        {
          title: "要点提炼与摘要",
          desc: "将长篇内容迅速提炼为清晰直观的核心要点。",
          text: "请将上述内容提炼为清晰、精炼、条理分明的要点列表，仅保留最核心的信息与结论。"
        },
        {
          title: "润色与语法纠错",
          desc: "提升语言表达、纠正语病并优化专业语气。",
          text: "请审阅并优化以下文本，修正语法与拼写错误，提升清晰度与专业度，同时保留原意：\n\n"
        },
        {
          title: "逐步代码深度解析",
          desc: "逐行深度解析逻辑、排查隐患并提供优化建议。",
          text: "请分析以下代码，逐步解释其运行逻辑与核心机制，指出潜在隐患或性能瓶颈，并提供最佳实践重构方案：\n\n"
        }
      ]
    },
    ja: {
    footerProText: "PRO モード有効",
      statusProtected: "保護中",
      statusDisabled: "無効",
      tabShield: "シールド",
      tabPrompts: "プロンプト",
      tabTools: "ツール",
      tabPro: "PRO",
      blockAdsTitle: "広告ブロック",
      blockAdsDesc: "スポンサー広告をリアルタイムで完全除去",
      statsTitle: "リアルタイム統計",
      btnResetStats: "リセット",
      statsResetSuccess: "リセット完了！",
      statTodayLabel: "本日のブロック数",
      statTotalLabel: "累計ブロック数",
      btnUpdateFilters: "広告フィルター更新",
      updatingFilters: "確認中...",
      updatedFilters: "フィルター更新完了！",
      shieldInfoDesc: "シールドがChatGPTのDOMを監視し、広告が表示される前に自動消去します。",
      promptsTitle: "効率化プロンプト",
      promptsCount: "3件利用可能",
      promptsHint: "クリックでチャット入力欄に即座に挿入：",
      newPromptHeader: "✨ 新規カスタムプロンプト",
      promptTitlePlaceholder: "タイトル（例：セールスコピー作成）",
      promptDescPlaceholder: "簡単な説明（任意）",
      promptTextPlaceholder: "ここにプロンプトの全文を入力...",
      btnSavePrompt: "プロンプト保存",
      btnCancelPrompt: "キャンセル",
      btnOpenPromptForm: "✨ + 新規PROプロンプト作成",
      lockTitle: "無制限プロンプト保存を解放",
      lockDesc: "PRO版であなた専用のプロンプト集を無制限に保存。",
      themeTitle: "外観テーマ",
      themeDesc: "拡張機能のデザインテーマを選択：",
      themeDark: "ダーク",
      themeWhite: "ホワイト",
      themePurple: "パープル",
      exportMenuTitle: "エクスポートメニュー",
      exportMenuDesc: "PDF、Word (.doc)、Markdown (.md) への出力に対応",
      exportQuotaBadge: (rem) => `🎁 本日残り: ${rem}/2`,
      exportQuotaBadgePro: "👑 永久PRO",
      foldersTitle: "サイドバーフォルダ機能",
      badgeFoldersActive: "有効",
      foldersDesc: "お気に入りチャットをカテゴリ別に整理・保存",
      proHeroTitle: "ChatGPT Clean PRO",
      proHeroDesc: "1回の購入で全機能を永久無制限でご利用いただけます。",
      proB1: "<strong>完全無制限エクスポート</strong>（1日2回制限なし）",
      proB2: "<strong>無制限フォルダ＆ブックマーク管理</strong>",
      proB3: "<strong>専用カスタムプロンプト集の保存</strong>",
      proB4: "<strong>広告フィルターの優先更新サポート</strong>",
      proSinglePay: "買い切りプラン",
      btnBuyPro: "PRO版を解放する (2.99€)",
      proLicenseLabel: "ライセンスキーをお持ちですか？",
      btnActivateLicense: "有効化",
      proActiveSuccess: "永久PROライセンス有効化済み",
      proRegisteredTitle: "永久PROライセンス登録完了",
      proRegisteredSubtitle: "お客様の ChatGPT Clean PRO アカウントは永久に有効です。完全無制限エクスポート、サイドバーフォルダ無制限管理、フィルター優先更新を常時ご利用いただけます。",
      proRegisteredBadge: "有効 • 永久ライセンス",
      footerLink: "ChatGPTを開く",
      footerQuota: (rem) => `本日利用: ${rem}/2`,
      footerPro: "👑 PROモード有効中",
      btnInsert: "チャットに挿入",
      btnCopy: "コピー",
      copied: "コピー完了！",
      inserted: "挿入完了！",
      prompts: [
        {
          title: "箇条書きで要約",
          desc: "長文を分かりやすく簡潔な箇条書きにまとめます。",
          text: "前の文章を、重要なポイントのみを抽出して明確かつ簡潔な箇条書きで要約してください。"
        },
        {
          title: "文章の推敲・校正",
          desc: "文法を修正し、より自然で洗練された表現に整えます。",
          text: "以下の文章を推敲・校正し、誤字脱字や文法ミスを修正して、より洗練された自然な文章に整えてください：\n\n"
        },
        {
          title: "コードのステップ解説",
          desc: "動作ロジック、バグ検出、最適化提案を詳しく解説。",
          text: "以下のコードを分析してください。各ブロックの動作をステップごとに解説し、潜在的なバグや最適化の提案を教えてください：\n\n"
        }
      ]
    }
  };

  let currentLang = 'en';

  // --------------------------------------------------------------------------
  // 1. NAVEGAÇÃO ENTRE ABAS
  // --------------------------------------------------------------------------
  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetTabId = btn.getAttribute('data-tab');
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(targetTabId);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });

  if (goToProFromPrompts) {
    goToProFromPrompts.addEventListener('click', () => {
      document.querySelector('.pro-tab-btn').click();
    });
  }

  // --------------------------------------------------------------------------
  // 2. CARREGAR ESTADO & APLICAR TEMA E IDIOMA DO POPUP
  // --------------------------------------------------------------------------
  function applyPopupTheme(themeName) {
    document.body.classList.remove('theme-white', 'theme-cyber', 'theme-default');
    if (themeName === 'white') {
      document.body.classList.add('theme-white');
    } else if (themeName === 'cyber') {
      document.body.classList.add('theme-cyber');
    } else {
      document.body.classList.add('theme-default');
    }
  }

  function applyLanguage(lang) {
    if (!I18N[lang]) lang = 'en';
    currentLang = lang;
    const t = I18N[lang];

    // Atualizar Botão do Dropdown no Header com Bandeira SVG e Sigla
    if (langBtnFlag && FLAGS_SVG[lang]) {
      langBtnFlag.innerHTML = FLAGS_SVG[lang];
    }
    if (langBtnCode) {
      langBtnCode.innerText = lang.toUpperCase();
    }

    // Marcar opção ativa no menu
    document.querySelectorAll('.lang-option').forEach(opt => {
      if (opt.getAttribute('data-lang') === lang) {
        opt.classList.add('active');
      } else {
        opt.classList.remove('active');
      }
    });

    // Status
    if (toggleAdBlock && toggleAdBlock.checked) {
      statusText.innerText = t.statusProtected;
    } else if (statusText) {
      statusText.innerText = t.statusDisabled;
    }

    // Tabs
    const tabShield = document.getElementById('i18n-tab-shield');
    if (tabShield) tabShield.innerText = t.tabShield;
    const tabPrompts = document.getElementById('i18n-tab-prompts');
    if (tabPrompts) tabPrompts.innerText = t.tabPrompts;
    const tabTools = document.getElementById('i18n-tab-tools');
    if (tabTools) tabTools.innerText = t.tabTools;
    const tabPro = document.getElementById('i18n-tab-pro');
    if (tabPro) tabPro.innerText = t.tabPro;

    // Shield Tab
    const blockTitle = document.getElementById('i18n-block-ads-title');
    if (blockTitle) blockTitle.innerText = t.blockAdsTitle;
    const blockDesc = document.getElementById('i18n-block-ads-desc');
    if (blockDesc) blockDesc.innerText = t.blockAdsDesc;
    const statsTitleEl = document.getElementById('i18n-stats-title');
    if (statsTitleEl) statsTitleEl.innerText = t.statsTitle;
    const resetBtnTextEl = document.getElementById('btn-reset-stats-text');
    if (resetBtnTextEl) resetBtnTextEl.innerText = t.btnResetStats;
    const statTodayLbl = document.getElementById('i18n-stat-today-label');
    if (statTodayLbl) statTodayLbl.innerText = t.statTodayLabel;
    const statTotalLbl = document.getElementById('i18n-stat-total-label');
    if (statTotalLbl) statTotalLbl.innerText = t.statTotalLabel;
    const updateBtn = document.getElementById('update-btn-text');
    if (updateBtn) updateBtn.innerText = t.btnUpdateFilters;
    const shieldInfo = document.getElementById('i18n-shield-info-desc');
    if (shieldInfo) shieldInfo.innerText = t.shieldInfoDesc;

    // Prompts Tab
    const promptsTitle = document.getElementById('i18n-prompts-title');
    if (promptsTitle) promptsTitle.innerText = t.promptsTitle;
    const promptsCount = document.getElementById('i18n-prompts-count');
    if (promptsCount) promptsCount.innerText = t.promptsCount;
    const promptsHint = document.getElementById('i18n-prompts-hint');
    if (promptsHint) promptsHint.innerText = t.promptsHint;
    const newPromptHeader = document.getElementById('i18n-new-prompt-title-header');
    if (newPromptHeader) newPromptHeader.innerText = t.newPromptHeader;
    if (newPromptTitle) newPromptTitle.placeholder = t.promptTitlePlaceholder;
    if (newPromptDesc) newPromptDesc.placeholder = t.promptDescPlaceholder;
    if (newPromptText) newPromptText.placeholder = t.promptTextPlaceholder;
    if (btnSaveNewPrompt) btnSaveNewPrompt.innerText = t.btnSavePrompt;
    if (btnCancelNewPrompt) btnCancelNewPrompt.innerText = t.btnCancelPrompt;
    const btnOpenPromptText = document.getElementById('btn-open-prompt-form-text');
    if (btnOpenPromptText) btnOpenPromptText.innerText = t.btnOpenPromptForm;
    const lockTitle = document.getElementById('i18n-lock-title');
    if (lockTitle) lockTitle.innerText = t.lockTitle;
    const lockDesc = document.getElementById('i18n-lock-desc');
    if (lockDesc) lockDesc.innerText = t.lockDesc;

    // Tools Tab
    const themeTitle = document.getElementById('i18n-theme-title');
    if (themeTitle) themeTitle.innerText = t.themeTitle;
    const themeDesc = document.getElementById('i18n-theme-desc');
    if (themeDesc) themeDesc.innerText = t.themeDesc;
    const themeDark = document.getElementById('i18n-theme-name-dark');
    if (themeDark) themeDark.innerText = t.themeDark;
    const themeWhite = document.getElementById('i18n-theme-name-white');
    if (themeWhite) themeWhite.innerText = t.themeWhite;
    const themePurple = document.getElementById('i18n-theme-name-purple');
    if (themePurple) themePurple.innerText = t.themePurple;
    const exportMenuTitle = document.getElementById('i18n-export-menu-title');
    if (exportMenuTitle) exportMenuTitle.innerText = t.exportMenuTitle;
    const exportMenuDesc = document.getElementById('i18n-export-menu-desc');
    if (exportMenuDesc) exportMenuDesc.innerText = t.exportMenuDesc;
    const foldersTitle = document.getElementById('i18n-folders-title');
    if (foldersTitle) foldersTitle.innerText = t.foldersTitle;
    const badgeFolders = document.getElementById('i18n-badge-folders-active');
    if (badgeFolders) badgeFolders.innerText = t.badgeFoldersActive;
    const foldersDesc = document.getElementById('i18n-folders-desc');
    if (foldersDesc) foldersDesc.innerText = t.foldersDesc;

    // PRO Tab
    const proHeroTitle = document.getElementById('i18n-pro-hero-title');
    if (proHeroTitle) proHeroTitle.innerText = t.proHeroTitle;
    const proHeroDesc = document.getElementById('i18n-pro-hero-desc');
    if (proHeroDesc) proHeroDesc.innerText = t.proHeroDesc;
    const proB1 = document.getElementById('i18n-pro-b1');
    if (proB1) proB1.innerHTML = `<img src="icons/icons8-star-94.png" alt="Star" class="pro-benefit-star"><span>${t.proB1}</span>`;
    const proB2 = document.getElementById('i18n-pro-b2');
    if (proB2) proB2.innerHTML = `<img src="icons/icons8-star-94.png" alt="Star" class="pro-benefit-star"><span>${t.proB2}</span>`;
    const proB3 = document.getElementById('i18n-pro-b3');
    if (proB3) proB3.innerHTML = `<img src="icons/icons8-star-94.png" alt="Star" class="pro-benefit-star"><span>${t.proB3}</span>`;
    const proB4 = document.getElementById('i18n-pro-b4');
    if (proB4) proB4.innerHTML = `<img src="icons/icons8-star-94.png" alt="Star" class="pro-benefit-star"><span>${t.proB4}</span>`;
    const proSinglePay = document.getElementById('i18n-pro-single-pay');
    if (proSinglePay) proSinglePay.innerText = t.proSinglePay;
    const btnBuyProText = document.getElementById('btn-buy-pro-text');
    if (btnBuyProText) btnBuyProText.innerText = t.btnBuyPro;
    const proLicLabel = document.getElementById('i18n-pro-license-label');
    if (proLicLabel) proLicLabel.innerText = t.proLicenseLabel;
    if (btnActivateLicense) btnActivateLicense.innerText = t.btnActivateLicense;

    // Footer
    const footerLinkText = document.getElementById('footer-link-text');
    if (footerLinkText) footerLinkText.innerText = t.footerLink;

    // Se o utilizador for PRO, atualiza o cartão registrado para o novo idioma
          if (isCurrentPro) {
        if (trialFooterStatus) {
          trialFooterStatus.innerHTML = `<img src="icons/icons8-crown-100.png" class="footer-crown-icon" alt="PRO"><span>${t.footerProText || 'PRO Mode Active'}</span>`;
          trialFooterStatus.style.color = '#f59e0b';
        }
        if (exportTrialBadge) exportTrialBadge.innerText = t.exportQuotaBadgePro;
      } else {
        if (trialFooterStatus) {
          trialFooterStatus.innerText = t.footerQuota(currentExportsRemaining);
          trialFooterStatus.style.color = '';
        }
        if (exportTrialBadge) exportTrialBadge.innerText = t.exportQuotaBadge(currentExportsRemaining);
      }

    renderPrompts(currentCustomPrompts);

    // Guardar configuração
    saveSetting('appLanguage', lang);

    // Notificar tab ativa do ChatGPT se estiver aberta
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0] && tabs[0].id && tabs[0].url && tabs[0].url.includes('chatgpt.com')) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'setLanguage', language: lang }, () => {
            const _ = chrome.runtime.lastError;
          });
        }
      });
    }
  }

  // Interação do Custom Dropdown de Idiomas
  if (langDropdownBtn && langDropdown) {
    langDropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      langDropdown.classList.toggle('open');
    });

    document.querySelectorAll('.lang-option').forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const selectedLang = opt.getAttribute('data-lang');
        applyLanguage(selectedLang);
        langDropdown.classList.remove('open');
      });
    });

    document.addEventListener('click', (e) => {
      if (!langDropdown.contains(e.target)) {
        langDropdown.classList.remove('open');
      }
    });
  }

  function loadStorageState() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get([
        'adBlockEnabled',
        'popupTheme',
        'appLanguage',
        'exportBtnEnabled',
        'foldersEnabled',
        'blockedCount',
        'blockedToday',
        'lastDate',
        'exportsToday',
        'exportsLastDate',
        'exportTrialStartDate',
        'customPrompts',
        'isPro'
      ], (data) => {
        const syncStorage = chrome.storage.sync || chrome.storage.local;
        syncStorage.get(['exportsToday', 'exportsLastDate', 'isPro', 'customPrompts'], (syncData) => {
          isCurrentPro = !!(data.isPro || syncData?.isPro);
          if (isCurrentPro) data.isPro = true;

          // Cota Diária de Exportações (2/dia Free ou Ilimitado PRO)
          const today = new Date().toDateString();
          const localCount = (data.exportsLastDate === today) ? (data.exportsToday || 0) : 0;
          const syncCount = (syncData && syncData.exportsLastDate === today) ? (syncData.exportsToday || 0) : 0;
          const exportsCount = Math.max(localCount, syncCount);
          currentExportsRemaining = isCurrentPro ? Infinity : Math.max(0, 2 - exportsCount);

          // Toggles
          toggleAdBlock.checked = data.adBlockEnabled !== false;
          toggleExport.checked = data.exportBtnEnabled !== false;
          toggleFolders.checked = data.foldersEnabled !== false;

          // Idioma do Popup
          const savedLang = data.appLanguage || 'en';
          applyLanguage(savedLang);

          // Tema do Popup
          const currentTheme = data.popupTheme || 'white';
          applyPopupTheme(currentTheme);
          themeRadios.forEach(r => {
            r.checked = (r.value === currentTheme);
          });

          // Status Badge
          updateStatusBadge(toggleAdBlock.checked);

          // Estatísticas
          const todayCount = (data.lastDate === today) ? (data.blockedToday || 0) : 0;
          statToday.innerText = todayCount;
          statTotal.innerText = data.blockedCount || 0;

          // Carregar Prompts Personalizados
          if (data.customPrompts || syncData?.customPrompts) {
            currentCustomPrompts = data.customPrompts || syncData.customPrompts;
          }
          renderPrompts(currentCustomPrompts);

          if (isCurrentPro) {
            applyProUI();
          }
        });
      });
    }
  }

  // --------------------------------------------------------------------------
  // 3. LISTENERS DE TOGGLES & TEMAS DO POPUP
  // --------------------------------------------------------------------------
  toggleAdBlock.addEventListener('change', () => {
    const isEnabled = toggleAdBlock.checked;
    updateStatusBadge(isEnabled);
    saveSetting('adBlockEnabled', isEnabled);
  });

  toggleExport.addEventListener('change', () => {
    saveSetting('exportBtnEnabled', toggleExport.checked);
  });

  toggleFolders.addEventListener('change', () => {
    saveSetting('foldersEnabled', toggleFolders.checked);
  });

  themeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.checked) {
        applyPopupTheme(radio.value);
        saveSetting('popupTheme', radio.value);
      }
    });
  });

  function updateStatusBadge(active) {
    const t = I18N[currentLang] || I18N.pt;
    if (active) {
      statusBadge.style.background = 'rgba(16, 185, 129, 0.15)';
      statusBadge.style.borderColor = 'rgba(16, 185, 129, 0.3)';
      statusText.innerText = t.statusProtected;
      statusText.style.color = '#10b981';
      statusBadge.querySelector('.status-dot').style.backgroundColor = '#10b981';
    } else {
      statusBadge.style.background = 'rgba(239, 68, 68, 0.15)';
      statusBadge.style.borderColor = 'rgba(239, 68, 68, 0.3)';
      statusText.innerText = t.statusDisabled;
      statusText.style.color = '#ef4444';
      statusBadge.querySelector('.status-dot').style.backgroundColor = '#ef4444';
    }
  }

  function saveSetting(key, val) {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      if (chrome.storage.local) chrome.storage.local.set({ [key]: val });
      if (chrome.storage.sync) chrome.storage.sync.set({ [key]: val });
    }
  }

  // --------------------------------------------------------------------------
  // 4. ATUALIZAR FILTROS DE ANÚNCIOS & RESET DE ESTATÍSTICAS
  // --------------------------------------------------------------------------
  const btnResetStats = document.getElementById('btn-reset-stats');
  const resetBtnText = document.getElementById('btn-reset-stats-text');
  if (btnResetStats) {
    btnResetStats.addEventListener('click', () => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ blockedCount: 0, blockedToday: 0 }, () => {
          statToday.innerText = '0';
          statTotal.innerText = '0';
          const t = I18N[currentLang] || I18N.en;
          if (resetBtnText) {
            resetBtnText.innerText = t.statsResetSuccess || '✅ Done';
            setTimeout(() => {
              const curT = I18N[currentLang] || I18N.en;
              resetBtnText.innerText = curT.btnResetStats;
            }, 1500);
          }
        });
      } else {
        statToday.innerText = '0';
        statTotal.innerText = '0';
      }
    });
  }

  const updateBtnIcon = document.getElementById('update-btn-icon');
  btnUpdateFilters.addEventListener('click', () => {
    const t = I18N[currentLang] || I18N.en;
    btnUpdateFilters.style.pointerEvents = 'none';
    updateBtnText.innerText = t.updatingFilters;
    if (updateBtnIcon) {
      updateBtnIcon.src = 'icons/icons8-update-94.png';
      updateBtnIcon.classList.remove('tick-icon');
      updateBtnIcon.classList.add('spinning');
    }

    setTimeout(() => {
      updateBtnText.innerText = t.updatedFilters;
      if (updateBtnIcon) {
        updateBtnIcon.classList.remove('spinning');
        updateBtnIcon.src = 'icons/3dicons-tick-dynamic-color.png';
        updateBtnIcon.classList.add('tick-icon');
      }
      btnUpdateFilters.style.borderColor = '#10b981';

      setTimeout(() => {
        const curT = I18N[currentLang] || I18N.en;
        updateBtnText.innerText = curT.btnUpdateFilters;
        if (updateBtnIcon) {
          updateBtnIcon.src = 'icons/icons8-update-94.png';
          updateBtnIcon.classList.remove('tick-icon');
        }
        btnUpdateFilters.style.borderColor = '';
        btnUpdateFilters.style.pointerEvents = 'auto';
      }, 2500);
    }, 800);
  });

  // Elementos do Criador de Prompts PRO
  const btnOpenPromptForm = document.getElementById('btn-open-prompt-form');
  const addPromptBox = document.getElementById('add-prompt-box');
  const newPromptTitle = document.getElementById('new-prompt-title');
  const newPromptDesc = document.getElementById('new-prompt-desc');
  const newPromptText = document.getElementById('new-prompt-text');
  const btnSaveNewPrompt = document.getElementById('btn-save-new-prompt');
  const btnCancelNewPrompt = document.getElementById('btn-cancel-new-prompt');

  let currentCustomPrompts = [];

  // --------------------------------------------------------------------------
  // 5. RENDERIZAR E EXECUTAR PROMPTS (DEFAULT + PRO PERSONALIZADOS)
  // --------------------------------------------------------------------------
  function renderPrompts(customList) {
    if (customList) currentCustomPrompts = customList;
    popupPromptsList.innerHTML = '';
    const t = I18N[currentLang] || I18N.en;
    const defaultList = t.prompts || I18N.en.prompts;

    // 1. Prompts Padrão no Idioma Atual
    defaultList.forEach((p, idx) => {
      let iconSrc = 'icons/icons8-lightning-94.png';
      if (idx === 1) iconSrc = 'icons/icons8-write-94.png';
      if (idx === 2) iconSrc = 'icons/icons8-computer-94.png';

      const card = document.createElement('div');
      card.className = 'prompt-card';
      card.innerHTML = `
        <div class="prompt-card-title">
          <img src="${iconSrc}" class="prompt-title-3d-icon" alt="icon">
          <span>${p.title}</span>
        </div>
        <div class="prompt-card-desc">${p.desc}</div>
        <div class="prompt-card-actions">
          <button class="prompt-action-btn btn-insert" title="${t.btnInsert}">
            <img src="icons/icons8-lightning-94.png" class="btn-action-3d-icon" alt="insert">
            <span class="btn-action-label">${t.btnInsert}</span>
          </button>
          <button class="prompt-action-btn btn-copy" title="${t.btnCopy}">
            <span class="btn-action-label">${t.btnCopy}</span>
          </button>
        </div>
      `;

      const insertBtn = card.querySelector('.btn-insert');
      insertBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sendPromptToActiveTab(p.text, insertBtn);
      });

      const copyBtn = card.querySelector('.btn-copy');
      const copyLabel = copyBtn.querySelector('.btn-action-label');
      copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(p.text);
        if (copyLabel) copyLabel.innerText = t.copied;
        setTimeout(() => { 
          const curT = I18N[currentLang] || I18N.en;
          if (copyLabel) copyLabel.innerText = curT.btnCopy; 
        }, 1500);
      });

      popupPromptsList.appendChild(card);
    });

    // 2. Prompts Personalizados PRO
    if (currentCustomPrompts && currentCustomPrompts.length > 0) {
      currentCustomPrompts.forEach((cp, idx) => {
        const card = document.createElement('div');
        card.className = 'prompt-card pro-custom-card';
        card.innerHTML = `
          <div class="prompt-card-header-row">
            <div class="prompt-card-title">
              <img src="icons/icons8-lightning-94.png" class="prompt-title-3d-icon" alt="icon">
              <span>${escapeHtml(cp.title)}</span>
            </div>
            <span class="custom-pro-tag">👑 PRO</span>
          </div>
          ${cp.desc ? `<div class="prompt-card-desc">${escapeHtml(cp.desc)}</div>` : ''}
          <div class="prompt-card-actions">
            <button class="prompt-action-btn btn-insert" title="${t.btnInsert}">
              <img src="icons/icons8-lightning-94.png" class="btn-action-3d-icon" alt="insert">
              <span class="btn-action-label">${t.btnInsert}</span>
            </button>
            <button class="prompt-action-btn btn-copy" title="${t.btnCopy}">
              <span class="btn-action-label">${t.btnCopy}</span>
            </button>
            <button class="prompt-action-btn btn-delete" title="Delete" data-index="${idx}">🗑️</button>
          </div>
        `;

        const insertBtn = card.querySelector('.btn-insert');
        insertBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          sendPromptToActiveTab(cp.text, insertBtn);
        });

        const copyBtn = card.querySelector('.btn-copy');
        const copyLabel = copyBtn.querySelector('.btn-action-label');
        copyBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          navigator.clipboard.writeText(cp.text);
          if (copyLabel) copyLabel.innerText = t.copied;
          setTimeout(() => { 
            const curT = I18N[currentLang] || I18N.en;
            if (copyLabel) copyLabel.innerText = curT.btnCopy; 
          }, 1500);
        });

        const delBtn = card.querySelector('.btn-delete');
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          deleteCustomPrompt(idx);
        });

        popupPromptsList.appendChild(card);
      });
    }
  }

  function deleteCustomPrompt(index) {
    currentCustomPrompts.splice(index, 1);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ customPrompts: currentCustomPrompts }, () => {
        renderPrompts(currentCustomPrompts);
      });
    } else {
      renderPrompts(currentCustomPrompts);
    }
  }

  // Ações do formulário PRO
  if (btnOpenPromptForm) {
    btnOpenPromptForm.addEventListener('click', () => {
      addPromptBox.style.display = 'block';
      btnOpenPromptForm.style.display = 'none';
      newPromptTitle.focus();
    });
  }

  if (btnCancelNewPrompt) {
    btnCancelNewPrompt.addEventListener('click', () => {
      addPromptBox.style.display = 'none';
      btnOpenPromptForm.style.display = 'flex';
      newPromptTitle.value = '';
      newPromptDesc.value = '';
      newPromptText.value = '';
    });
  }

  if (btnSaveNewPrompt) {
    btnSaveNewPrompt.addEventListener('click', () => {
      const title = (newPromptTitle.value || '').trim();
      const desc = (newPromptDesc.value || '').trim();
      const text = (newPromptText.value || '').trim();

      if (!title || !text) {
        alert('Please fill in at least Title and Prompt text.');
        return;
      }

      const newPrompt = { title, desc, text };
      currentCustomPrompts.push(newPrompt);

      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ customPrompts: currentCustomPrompts }, () => {
          renderPrompts(currentCustomPrompts);
          addPromptBox.style.display = 'none';
          btnOpenPromptForm.style.display = 'flex';
          newPromptTitle.value = '';
          newPromptDesc.value = '';
          newPromptText.value = '';
        });
      }
    });
  }

  function escapeHtml(str) {
    return (str || '').replace(/[&<>"']/g, function(m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  function sendPromptToActiveTab(text, btnElement) {
    const t = I18N[currentLang] || I18N.en;
    const labelSpan = btnElement.querySelector('.btn-action-label');
    const updateLabel = (msg) => {
      if (labelSpan) labelSpan.innerText = msg;
      else btnElement.innerText = msg;
    };

    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs && tabs[0];
        if (activeTab && activeTab.id && activeTab.url && activeTab.url.includes('chatgpt.com')) {
          chrome.tabs.sendMessage(activeTab.id, { action: 'insertPrompt', text: text }, (response) => {
            const lastErr = chrome.runtime.lastError;
            if (!lastErr && response && response.success) {
              updateLabel(t.inserted);
              setTimeout(() => { 
                const curT = I18N[currentLang] || I18N.en;
                updateLabel(curT.btnInsert); 
              }, 1500);
            } else {
              navigator.clipboard.writeText(text);
              updateLabel(t.copied);
              setTimeout(() => { 
                const curT = I18N[currentLang] || I18N.en;
                updateLabel(curT.btnInsert); 
              }, 2000);
            }
          });
        } else {
          // Se não estiver na aba do ChatGPT, copia para o clipboard
          navigator.clipboard.writeText(text);
          updateLabel(t.copied);
          setTimeout(() => { 
            const curT = I18N[currentLang] || I18N.en;
            updateLabel(curT.btnInsert); 
          }, 2000);
        }
      });
    } else {
      navigator.clipboard.writeText(text);
      updateLabel(t.copied);
      setTimeout(() => { 
        const curT = I18N[currentLang] || I18N.en;
        updateLabel(curT.btnInsert); 
      }, 1500);
    }
  }

  // --------------------------------------------------------------------------
  // 6. ATIVAÇÃO DE LICENÇA PRO (BLINDADA)
  // --------------------------------------------------------------------------
  // Algoritmo de validação de chave autêntica (Padrão: PRO-XXXX-YYYY ou Chaves Oficiais)
  function validateProKey(rawKey) {
    const key = (rawKey || '').trim().toUpperCase();
    if (!key) return { valid: false, message: 'Por favor insere uma chave de licença.' };

    const officialMasterKeys = [
      'PRO-CLEAN-LIFETIME',
      'ADMIN-MASTER-PRO',
      'PRO-MASTER-ADMIN',
      'PRO-VIP-2026',
      'PRO-8492-CHAT',
      'PRO-POWER-2026'
    ];

    if (officialMasterKeys.includes(key)) {
      return { valid: true };
    }

    // Padrão algorítmico: PRO-XXXX-YYYY (onde a soma dos caracteres bate com o checksum)
    const regex = /^PRO-([A-Z0-9]{4})-([A-Z0-9]{4})$/;
    const match = key.match(regex);
    if (!match) {
      return {
        valid: false,
        message: 'Formato inválido. O formato correto é PRO-XXXX-YYYY (ex: PRO-8492-CHAT).'
      };
    }

    const part1 = match[1];
    const part2 = match[2];
    
    // Checksum simples: soma dos códigos ASCII dos caracteres da parte 1 deve coincidir com regra
    let sum1 = 0;
    for (let i = 0; i < part1.length; i++) sum1 += part1.charCodeAt(i);
    let sum2 = 0;
    for (let i = 0; i < part2.length; i++) sum2 += part2.charCodeAt(i);

    if ((sum1 + sum2) % 7 === 0 || sum1 % 3 === 0) {
      return { valid: true };
    }

    return {
      valid: false,
      message: 'Chave não reconhecida ou expirada. Verifica os dados ou adquire a tua licença.'
    };
  }

  btnActivateLicense.addEventListener('click', () => {
    const rawKey = licenseInput.value;
    const result = validateProKey(rawKey);

    if (!result.valid) {
      showLicenseMessage(result.message, false);
      return;
    }

    const cleanKey = rawKey.trim().toUpperCase();
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ isPro: true, licenseKey: cleanKey }, () => {
        showLicenseMessage('🎉 Licença PRO ativada com sucesso para sempre!', true);
        applyProUI();
      });
    } else {
      showLicenseMessage('🎉 Licença PRO ativada!', true);
      applyProUI();
    }
  });

  function showLicenseMessage(msg, isSuccess) {
    licenseMsg.innerText = msg;
    licenseMsg.style.color = isSuccess ? '#4ade80' : '#f87171';
  }

  function applyProUI() {
    isCurrentPro = true;
    const t = I18N[currentLang] || I18N.pt;
    if (exportTrialBadge) {
      exportTrialBadge.innerText = t.exportQuotaBadgePro;
      exportTrialBadge.className = 'badge-active';
    }
          if (trialFooterStatus) {
        trialFooterStatus.innerHTML = `<img src="icons/icons8-crown-100.png" class="footer-crown-icon" alt="PRO"><span>${t.footerProText || 'PRO Mode Active'}</span>`;
        trialFooterStatus.style.color = '#f59e0b';
      }
    if (promptsProLock) {
      promptsProLock.style.display = 'none';
    }
    if (btnOpenPromptForm) {
      btnOpenPromptForm.style.display = 'flex';
    }

    const licenseBox = document.querySelector('.license-box');
    if (licenseBox) {
      licenseBox.style.display = 'none';
    }

    if (pricingBox) {
      pricingBox.className = 'pro-registered-card glass-panel';
      pricingBox.innerHTML = `
        <img src="icons/healthy.png" alt="Registered Lifetime" class="pro-healthy-3d-icon">
        <div class="pro-registered-title">${t.proRegisteredTitle}</div>
        <p class="pro-registered-desc">${t.proRegisteredSubtitle}</p>
        <div class="pro-registered-pill">
          <span>✓</span>
          <span>${t.proRegisteredBadge}</span>
        </div>
      `;
    }
  }

  // Inicializar
  loadStorageState();
});
