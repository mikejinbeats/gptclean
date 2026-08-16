/**
 * ChatGPT Clean - Content Script Completo
 * Bloqueio de anúncios, Modal de Exportação com 3 opções (PDF/Word/MD),
 * pastas na barra lateral e injeção de prompts.
 */

(() => {
  'use strict';

  let state = {
    adBlockEnabled: true,
    exportBtnEnabled: true,
    foldersEnabled: true,
    promptsEnabled: true,
    isPro: false,
    appLanguage: 'pt',
    exportTrialStartDate: null,
    customPrompts: [],
    folders: [
      { id: 'f1', name: '💼 Trabalho', count: 3 },
      { id: 'f2', name: '💡 Ideias', count: 5 },
      { id: 'f3', name: '📚 Estudos', count: 2 }
    ]
  };

  const CONTENT_I18N = {
    pt: {
      exportBtn: "Exportar",
      exportBtnTitle: "Escolher formato para exportar (PDF, Word, Markdown)",
      exportFullBtn: "Exportar Chat Completo",
      exportFullBtnTitle: "Exportar todas as perguntas e respostas desta conversa",
      exportToastMd: "✅ Ficheiro Markdown (.md) descarregado!",
      exportToastWord: "✅ Ficheiro Word (.doc) descarregado!",
      promptInserted: "⚡ Prompt inserido no ChatGPT!",
      quickPromptsTooltip: "Prompts Rápidos",
      defaultFolders: { f1: '💼 Trabalho', f2: '💡 Ideias', f3: '📚 Estudos' },
      foldersHeader: "📁 Pastas & Favoritos",
      btnAddFolder: "+ Nova Pasta",
      promptNewFolderName: "Nome da nova pasta:",
      toastFolderCreated: "📁 Pasta criada!",
      toastFolderDeleted: "🗑️ Pasta eliminada!",
      btnPinChat: "📌 +Chat",
      noChatSaved: "Nenhum chat guardado ainda.",
      toastChatSaved: "📌 Conversa guardada nesta pasta!",
      limitModalTitle: "🔒 Limite Diário Atingido",
      limitModalHeading: "Atingiste as tuas 2 exportações gratuitas de hoje!",
      limitModalDesc: "O teu limite de 2 exportações diárias reseta automaticamente amanhã à meia-noite.",
      limitOfferTitle: "🚀 Queres exportações infinitas?",
      limitOfferDesc: "Com o plano PRO tens exportações ilimitadas para sempre sem restrições de cota.",
      limitSinglePay: "Pagamento Único",
      limitUpgradeBtn: "👑 Desbloquear Exportações Ilimitadas (2,99€)",
      exportModalHeading: (suffix) => `📥 Exportar ${suffix || 'Conversa'}`,
      exportQuotaBadge: (rem) => `🎁 Grátis: ${rem}/2 hoje`,
      exportQuotaBadgePro: "👑 Ilimitado PRO",
      cardPdfTitle: "Documento PDF (.pdf)",
      cardPdfDesc: "Layout formatado pronto para guardar ou imprimir",
      cardWordTitle: "Microsoft Word (.doc)",
      cardWordDesc: "Com títulos, tabelas e formatação intactos",
      cardMdTitle: "Ficheiro Markdown (.md)",
      cardMdDesc: "Ideal para Notion, Obsidian e desenvolvedores"
    },
    en: {
      exportBtn: "Export",
      exportBtnTitle: "Choose format to export (PDF, Word, Markdown)",
      exportFullBtn: "Export Full Chat",
      exportFullBtnTitle: "Export all questions and answers in this conversation",
      exportToastMd: "✅ Markdown (.md) file downloaded!",
      exportToastWord: "✅ Word (.doc) file downloaded!",
      promptInserted: "⚡ Prompt inserted into ChatGPT!",
      quickPromptsTooltip: "Quick Prompts",
      defaultFolders: { f1: '💼 Work', f2: '💡 Ideas', f3: '📚 Studies' },
      foldersHeader: "📁 Folders & Bookmarks",
      btnAddFolder: "+ New Folder",
      promptNewFolderName: "New folder name:",
      toastFolderCreated: "📁 Folder created!",
      toastFolderDeleted: "🗑️ Folder deleted!",
      btnPinChat: "📌 +Chat",
      noChatSaved: "No chats saved yet.",
      toastChatSaved: "📌 Conversation saved to this folder!",
      limitModalTitle: "🔒 Daily Limit Reached",
      limitModalHeading: "You have reached your 2 free exports today!",
      limitModalDesc: "Your daily quota of 2 free exports will reset tomorrow at midnight.",
      limitOfferTitle: "🚀 Want unlimited exports?",
      limitOfferDesc: "With PRO plan you get lifetime unlimited exports without quota restrictions.",
      limitSinglePay: "One-Time Payment",
      limitUpgradeBtn: "👑 Unlock Unlimited Exports ($2.99)",
      exportModalHeading: (suffix) => `📥 Export ${suffix || 'Conversation'}`,
      exportQuotaBadge: (rem) => `🎁 Free: ${rem}/2 today`,
      exportQuotaBadgePro: "👑 PRO Unlimited",
      cardPdfTitle: "PDF Document (.pdf)",
      cardPdfDesc: "Formatted layout ready for saving or printing",
      cardWordTitle: "Microsoft Word (.doc)",
      cardWordDesc: "Formatted with headings, tables, and clean layout",
      cardMdTitle: "Markdown File (.md)",
      cardMdDesc: "Best for Notion, Obsidian, and developers"
    },
    es: {
      exportBtn: "Exportar",
      exportBtnTitle: "Elegir formato para exportar (PDF, Word, Markdown)",
      exportFullBtn: "Exportar Chat Completo",
      exportFullBtnTitle: "Exportar todas las preguntas y respuestas de esta conversación",
      exportToastMd: "✅ ¡Archivo Markdown (.md) descargado!",
      exportToastWord: "✅ ¡Archivo Word (.doc) descargado!",
      promptInserted: "⚡ ¡Prompt insertado en ChatGPT!",
      quickPromptsTooltip: "Prompts Rápidos",
      defaultFolders: { f1: '💼 Trabajo', f2: '💡 Ideas', f3: '📚 Estudios' },
      foldersHeader: "📁 Carpetas y Favoritos",
      btnAddFolder: "+ Nueva Carpeta",
      promptNewFolderName: "Nombre de la nueva carpeta:",
      toastFolderCreated: "📁 ¡Carpeta creada!",
      toastFolderDeleted: "🗑️ ¡Carpeta eliminada!",
      btnPinChat: "📌 +Chat",
      noChatSaved: "Sin chats guardados aún.",
      toastChatSaved: "📌 ¡Conversación guardada en esta carpeta!",
      limitModalTitle: "🔒 Límite Diario Alcanzado",
      limitModalHeading: "¡Has alcanzado tus 2 exportaciones gratuitas de hoy!",
      limitModalDesc: "Tu cuota diaria de 2 exportaciones se restablecerá mañana a medianoche.",
      limitOfferTitle: "🚀 ¿Quieres exportaciones ilimitadas?",
      limitOfferDesc: "Con el plan PRO tienes exportaciones infinitas de por vida sin restricciones.",
      limitSinglePay: "Pago Único",
      limitUpgradeBtn: "👑 Desbloquear Exportaciones Ilimitadas (2,99€)",
      exportModalHeading: (suffix) => `📥 Exportar ${suffix || 'Conversación'}`,
      exportQuotaBadge: (rem) => `🎁 Gratis: ${rem}/2 hoy`,
      exportQuotaBadgePro: "👑 Ilimitado PRO",
      cardPdfTitle: "Documento PDF (.pdf)",
      cardPdfDesc: "Diseño formateado listo para guardar o imprimir",
      cardWordTitle: "Microsoft Word (.doc)",
      cardWordDesc: "Con títulos, tablas y formato intacto",
      cardMdTitle: "Archivo Markdown (.md)",
      cardMdDesc: "Ideal para Notion, Obsidian y programadores"
    },
    fr: {
      exportBtn: "Exporter",
      exportBtnTitle: "Choisir le format d'export (PDF, Word, Markdown)",
      exportFullBtn: "Exporter le Chat Complet",
      exportFullBtnTitle: "Exporter toutes les questions et réponses de cette discussion",
      exportToastMd: "✅ Fichier Markdown (.md) téléchargé !",
      exportToastWord: "✅ Fichier Word (.doc) téléchargé !",
      promptInserted: "⚡ Prompt inséré dans ChatGPT !",
      quickPromptsTooltip: "Prompts Rapides",
      defaultFolders: { f1: '💼 Travail', f2: '💡 Idées', f3: '📚 Études' },
      foldersHeader: "📁 Dossiers & Favoris",
      btnAddFolder: "+ Nouveau Dossier",
      promptNewFolderName: "Nom du nouveau dossier :",
      toastFolderCreated: "📁 Dossier créé !",
      toastFolderDeleted: "🗑️ Dossier supprimé !",
      btnPinChat: "📌 +Chat",
      noChatSaved: "Aucune discussion enregistrée.",
      toastChatSaved: "📌 Discussion enregistrée dans ce dossier !",
      limitModalTitle: "🔒 Limite Quotidienne Atteinte",
      limitModalHeading: "Vous avez atteint vos 2 exports gratuits aujourd'hui !",
      limitModalDesc: "Votre quota de 2 exports quotidiens sera réinitialisé demain à minuit.",
      limitOfferTitle: "🚀 Vous voulez des exports illimités ?",
      limitOfferDesc: "Avec le forfait PRO, profitez d'exports illimités à vie sans aucune restriction.",
      limitSinglePay: "Paiement Unique",
      limitUpgradeBtn: "👑 Débloquer les Exports Illimités (2,99€)",
      exportModalHeading: (suffix) => `📥 Exporter ${suffix || 'Discussion'}`,
      exportQuotaBadge: (rem) => `🎁 Gratuit : ${rem}/2 auj.`,
      exportQuotaBadgePro: "👑 Illimité PRO",
      cardPdfTitle: "Document PDF (.pdf)",
      cardPdfDesc: "Mise en page prête pour impression ou archivage",
      cardWordTitle: "Microsoft Word (.doc)",
      cardWordDesc: "Avec titres, tableaux et structure propre",
      cardMdTitle: "Fichier Markdown (.md)",
      cardMdDesc: "Idéal pour Notion, Obsidian et développeurs"
    },
    de: {
      exportBtn: "Exportieren",
      exportBtnTitle: "Exportformat wählen (PDF, Word, Markdown)",
      exportFullBtn: "Kompletten Chat Exportieren",
      exportFullBtnTitle: "Alle Fragen und Antworten dieses Chats exportieren",
      exportToastMd: "✅ Markdown (.md) Datei heruntergeladen!",
      exportToastWord: "✅ Word (.doc) Datei heruntergeladen!",
      promptInserted: "⚡ Prompt in ChatGPT eingefügt!",
      quickPromptsTooltip: "Schnelle Prompts",
      defaultFolders: { f1: '💼 Arbeit', f2: '💡 Ideen', f3: '📚 Studium' },
      foldersHeader: "📁 Ordner & Lesezeichen",
      btnAddFolder: "+ Neuer Ordner",
      promptNewFolderName: "Name des neuen Ordners:",
      toastFolderCreated: "📁 Ordner erstellt!",
      toastFolderDeleted: "🗑️ Ordner gelöscht!",
      btnPinChat: "📌 +Chat",
      noChatSaved: "Noch keine Chats gespeichert.",
      toastChatSaved: "📌 Chat in diesem Ordner gespeichert!",
      limitModalTitle: "🔒 Tageslimit Erreicht",
      limitModalHeading: "Sie haben Ihre 2 kostenlosen Exporte für heute erreicht!",
      limitModalDesc: "Ihr tägliches Kontingent wird morgen um Mitternacht zurückgesetzt.",
      limitOfferTitle: "🚀 Möchten Sie unbegrenzte Exporte?",
      limitOfferDesc: "Mit dem PRO-Plan erhalten Sie lebenslang unbegrenzte Exporte ohne Limit.",
      limitSinglePay: "Einmalzahlung",
      limitUpgradeBtn: "👑 Unbegrenzte Exporte Freischalten (2,99€)",
      exportModalHeading: (suffix) => `📥 ${suffix || 'Chat'} Exportieren`,
      exportQuotaBadge: (rem) => `🎁 Gratis: ${rem}/2 heute`,
      exportQuotaBadgePro: "👑 Unbegrenzt PRO",
      cardPdfTitle: "PDF-Dokument (.pdf)",
      cardPdfDesc: "Formatiertes Layout bereit zum Speichern oder Drucken",
      cardWordTitle: "Microsoft Word (.doc)",
      cardWordDesc: "Mit Überschriften, Tabellen und Struktur",
      cardMdTitle: "Markdown-Datei (.md)",
      cardMdDesc: "Ideal für Notion, Obsidian und Entwickler"
    },
    it: {
      exportBtn: "Esporta",
      exportBtnTitle: "Scegli formato di esportazione (PDF, Word, Markdown)",
      exportFullBtn: "Esporta Chat Completa",
      exportFullBtnTitle: "Esporta tutte le domande e risposte di questa chat",
      exportToastMd: "✅ File Markdown (.md) scaricato!",
      exportToastWord: "✅ File Word (.doc) scaricato!",
      promptInserted: "⚡ Prompt inserito in ChatGPT!",
      quickPromptsTooltip: "Prompt Rapidi",
      defaultFolders: { f1: '💼 Lavoro', f2: '💡 Idee', f3: '📚 Studio' },
      foldersHeader: "📁 Cartelle e Segnalibri",
      btnAddFolder: "+ Nuova Cartella",
      promptNewFolderName: "Nome della nuova cartella:",
      toastFolderCreated: "📁 Cartella creata!",
      toastFolderDeleted: "🗑️ Cartella eliminata!",
      btnPinChat: "📌 +Chat",
      noChatSaved: "Nessuna chat salvata.",
      toastChatSaved: "📌 Chat salvata in questa cartella!",
      limitModalTitle: "🔒 Limite Giornaliero Raggiunto",
      limitModalHeading: "Hai raggiunto le tue 2 esportazioni gratuite di oggi!",
      limitModalDesc: "La tua quota giornaliera di 2 esportazioni si resetterà domani a mezzanotte.",
      limitOfferTitle: "🚀 Vuoi esportazioni infinite?",
      limitOfferDesc: "Con il piano PRO hai esportazioni illimitate a vita senza restrizioni.",
      limitSinglePay: "Pagamento Singolo",
      limitUpgradeBtn: "👑 Sblocca Esportazioni Illimitate (2,99€)",
      exportModalHeading: (suffix) => `📥 Esporta ${suffix || 'Conversazione'}`,
      exportQuotaBadge: (rem) => `🎁 Gratis: ${rem}/2 oggi`,
      exportQuotaBadgePro: "👑 Illimitato PRO",
      cardPdfTitle: "Documento PDF (.pdf)",
      cardPdfDesc: "Layout formattato pronto per il salvataggio o la stampa",
      cardWordTitle: "Microsoft Word (.doc)",
      cardWordDesc: "Con titoli, tabelle e formattazione intatta",
      cardMdTitle: "File Markdown (.md)",
      cardMdDesc: "Ideale per Notion, Obsidian e sviluppatori"
    },
    zh: {
      exportBtn: "导出",
      exportBtnTitle: "选择导出格式（PDF、Word、Markdown）",
      exportFullBtn: "导出完整对话",
      exportFullBtnTitle: "导出本会话中的所有提问与回答",
      exportToastMd: "✅ Markdown (.md) 文件已成功下载！",
      exportToastWord: "✅ Word (.doc) 文档已成功下载！",
      promptInserted: "⚡ 提示词已成功插入输入框！",
      quickPromptsTooltip: "快捷提示词",
      defaultFolders: { f1: '💼 工作', f2: '💡 灵感', f3: '📚 学习' },
      foldersHeader: "📁 侧边栏分类文件夹",
      btnAddFolder: "+ 新建文件夹",
      promptNewFolderName: "请输入新文件夹名称：",
      toastFolderCreated: "📁 文件夹创建成功！",
      toastFolderDeleted: "🗑️ 文件夹已删除！",
      btnPinChat: "📌 +收藏",
      noChatSaved: "暂无收藏对话。",
      toastChatSaved: "📌 当前对话已成功收藏至此文件夹！",
      limitModalTitle: "🔒 今日免费导出额度已用尽",
      limitModalHeading: "您今日的2次免费导出额度已达上限！",
      limitModalDesc: "每日2次免费额度将于明日零点自动刷新重置。",
      limitOfferTitle: "🚀 想要无限制极速导出？",
      limitOfferDesc: "升级PRO专业版，即可永久解锁终身无限次全格式导出特权。",
      limitSinglePay: "一次性买断",
      limitUpgradeBtn: "👑 立即解锁无限导出 (2.99€)",
      exportModalHeading: (suffix) => `📥 导出${suffix || '当前对话'}`,
      exportQuotaBadge: (rem) => `🎁 今日剩余: ${rem}/2`,
      exportQuotaBadgePro: "👑 终身PRO无限",
      cardPdfTitle: "PDF 高清文档 (.pdf)",
      cardPdfDesc: "精美排版，支持直接打印或归档保存",
      cardWordTitle: "Microsoft Word 文档 (.doc)",
      cardWordDesc: "完整保留标题、代码块与表格结构",
      cardMdTitle: "Markdown 纯文本 (.md)",
      cardMdDesc: "完美兼容 Notion、Obsidian 及开发者笔记"
    },
    ja: {
      exportBtn: "エクスポート",
      exportBtnTitle: "出力形式を選択 (PDF, Word, Markdown)",
      exportFullBtn: "チャット全体を出力",
      exportFullBtnTitle: "この会話のすべての質問と回答を出力",
      exportToastMd: "✅ Markdown (.md) ファイルをダウンロードしました！",
      exportToastWord: "✅ Word (.doc) ファイルをダウンロードしました！",
      promptInserted: "⚡ プロンプトを入力欄に挿入しました！",
      quickPromptsTooltip: "クイックプロンプト",
      defaultFolders: { f1: '💼 仕事', f2: '💡 アイデア', f3: '📚 学習' },
      foldersHeader: "📁 フォルダ＆お気に入り",
      btnAddFolder: "+ 新規フォルダ",
      promptNewFolderName: "新しいフォルダ名を入力：",
      toastFolderCreated: "📁 フォルダを作成しました！",
      toastFolderDeleted: "🗑️ フォルダを削除しました！",
      btnPinChat: "📌 +保存",
      noChatSaved: "保存されたチャットはありません。",
      toastChatSaved: "📌 このフォルダにチャットを保存しました！",
      limitModalTitle: "🔒 本日の無料枠上限に達しました",
      limitModalHeading: "本日の2回無料エクスポートを使い切りました！",
      limitModalDesc: "1日2回の無料利用枠は明日の午前0時に自動リセットされます。",
      limitOfferTitle: "🚀 無制限で利用したいですか？",
      limitOfferDesc: "PROプランなら回数制限なしで永久に無制限エクスポートが可能です。",
      limitSinglePay: "買い切りプラン",
      limitUpgradeBtn: "👑 無制限エクスポートを解放 (2.99€)",
      exportModalHeading: (suffix) => `📥 ${suffix || '会話'}をエクスポート`,
      exportQuotaBadge: (rem) => `🎁 本日残り: ${rem}/2`,
      exportQuotaBadgePro: "👑 永久PRO無制限",
      cardPdfTitle: "PDF ドキュメント (.pdf)",
      cardPdfDesc: "印刷や保存に最適なフォーマット済みレイアウト",
      cardWordTitle: "Microsoft Word (.doc)",
      cardWordDesc: "見出しや表のレイアウトをそのまま保持",
      cardMdTitle: "Markdown ファイル (.md)",
      cardMdDesc: "NotionやObsidian、開発者に最適"
    }
  };

  // --------------------------------------------------------------------------
  // 1. CARREGAR DEFINIÇÕES & OUVIR MUDANÇAS
  // --------------------------------------------------------------------------
  function loadSettings() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get([
        'adBlockEnabled',
        'exportBtnEnabled',
        'foldersEnabled',
        'promptsEnabled',
        'appLanguage',
        'isPro',
        'exportTrialStartDate',
        'customPrompts',
        'folders'
      ], (items) => {
        if (items.adBlockEnabled !== undefined) state.adBlockEnabled = items.adBlockEnabled;
        if (items.exportBtnEnabled !== undefined) state.exportBtnEnabled = items.exportBtnEnabled;
        if (items.foldersEnabled !== undefined) state.foldersEnabled = items.foldersEnabled;
        if (items.promptsEnabled !== undefined) state.promptsEnabled = items.promptsEnabled;
        if (items.appLanguage !== undefined) state.appLanguage = items.appLanguage;
        if (items.isPro !== undefined) state.isPro = items.isPro;
        if (items.customPrompts) state.customPrompts = items.customPrompts;

        // Atualizar nomes padrão das pastas para o idioma ativo se forem as originais
        if (items.folders) {
          state.folders = items.folders;
        } else {
          const t = CONTENT_I18N[state.appLanguage] || CONTENT_I18N.pt;
          state.folders = [
            { id: 'f1', name: t.defaultFolders.f1, chats: [] },
            { id: 'f2', name: t.defaultFolders.f2, chats: [] },
            { id: 'f3', name: t.defaultFolders.f3, chats: [] }
          ];
        }

        if (state.adBlockEnabled) {
          cleanAds();
        }
        injectTools();
      });
    }
  }

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local') {
        for (let key in changes) {
          state[key] = changes[key].newValue;
        }
        if (state.adBlockEnabled) {
          cleanAds();
        }
        injectTools();
      }
    });
  }

  // Ouvir mensagens do Popup (Inserir Prompt / Mudar Idioma)
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'insertPrompt') {
        insertPromptIntoInput(request.text);
        const t = CONTENT_I18N[state.appLanguage] || CONTENT_I18N.pt;
        showToast(t.promptInserted);
        sendResponse({ success: true });
        return true;
      }
      if (request.action === 'setLanguage') {
        state.appLanguage = request.language;
        // Re-traduzir pastas padrão se não tiverem sido customizadas
        const t = CONTENT_I18N[state.appLanguage] || CONTENT_I18N.pt;
        state.folders.forEach(f => {
          if (t.defaultFolders[f.id]) {
            f.name = t.defaultFolders[f.id];
          }
        });
        document.querySelectorAll('.chatgpt-clean-export-btn, .chatgpt-clean-global-export-btn, .chatgpt-clean-folders-container, .chatgpt-clean-prompt-trigger').forEach(el => el.remove());
        injectTools();
        sendResponse({ success: true });
        return true;
      }
    });
  }

  // --------------------------------------------------------------------------
  // 2. MOTOR REAL DE REMOÇÃO DE ANÚNCIOS (4 CAMADAS DE PRECISÃO CIRÚRGICA)
  // --------------------------------------------------------------------------
  function cleanAds() {
    if (!state.adBlockEnabled) return;

    let removed = 0;

    // Camada 1: Seletores Explícitos de Publicidade e Parceiros
    const explicitAdSelectors = [
      '[data-testid="search-ad"]',
      '[data-testid="sponsored-result"]',
      '[data-testid="sponsored-search-item"]',
      '[data-testid="web-search-sponsored"]',
      '[data-testid="sponsored-card"]',
      '[data-testid="partner-sponsored-item"]',
      '[data-is-sponsored="true"]',
      'div[class*="sponsored-card"]',
      'div[class*="sponsored-message"]',
      'div[class*="ad-container"]',
      'div[class*="ad-unit"]',
      'div[class*="ad-banner"]',
      'div[aria-label="Sponsored" i]',
      'div[aria-label="Patrocinado" i]',
      'div[aria-label="Advertisement" i]',
      'div[aria-label="Publicidade" i]',
      'section[aria-label="Sponsored" i]',
      'section[aria-label="Patrocinado" i]'
    ];

    try {
      const candidates = document.querySelectorAll(explicitAdSelectors.join(','));
      candidates.forEach((el) => {
        if (!el.matches('article[data-testid^="conversation-turn-"]') && !el.closest('pre') && !el.closest('code')) {
          el.remove();
          removed++;
        }
      });
    } catch (e) {}

    // Camada 2: Detecção e Remoção de Links Comerciais & Afiliados (Bing/Aclick/Ads)
    try {
      const adLinks = document.querySelectorAll(
        'a[href*="bing.com/aclick"], a[href*="bat.bing.com"], a[href*="ads.openai.com"], a[href*="googleadservices.com"], a[href*="doubleclick.net"], a[href*="adnxs.com"]'
      );
      adLinks.forEach((link) => {
        const adCard = link.closest('[data-testid*="citation"], [class*="citation"], div[class*="card"], li, div');
        if (adCard && !adCard.matches('article[data-testid^="conversation-turn-"]') && !adCard.closest('pre') && !adCard.closest('code')) {
          adCard.remove();
          removed++;
        } else {
          link.remove();
          removed++;
        }
      });
    } catch (e) {}

    // Camada 3: Remoção de Iframes e Redes Publicitárias
    try {
      const adIframes = document.querySelectorAll(
        'iframe[src*="googlesyndication.com"], iframe[src*="doubleclick.net"], iframe[src*="amazon-adsystem.com"], iframe[src*="adnxs.com"]'
      );
      adIframes.forEach((iframe) => {
        iframe.remove();
        removed++;
      });
    } catch (e) {}

    // Camada 4: Análise Heurística de Blocos com Selo "Sponsored / Patrocinado"
    try {
      const sponsorBadges = document.querySelectorAll('span, div, p');
      sponsorBadges.forEach((badge) => {
        if (badge.children.length === 0) {
          const text = (badge.innerText || '').trim().toLowerCase();
          if (text === 'sponsored' || text === 'patrocinado' || text === 'advertisement' || text === 'publicidade') {
            const parentBlock = badge.closest('div[class*="border"], div[class*="card"], div[class*="rounded"], div[class*="bg-"]');
            if (parentBlock && !parentBlock.matches('article[data-testid^="conversation-turn-"]') && !parentBlock.closest('pre') && !parentBlock.closest('code')) {
              const hasLink = parentBlock.querySelector('a[href^="http"]');
              if (hasLink) {
                parentBlock.remove();
                removed++;
              }
            }
          }
        }
      });
    } catch (e) {}

    if (removed > 0) {
      incrementBlockedCount(removed);
    }
  }

  function incrementBlockedCount(count) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['blockedCount', 'blockedToday', 'lastDate'], (data) => {
        const today = new Date().toDateString();
        const total = (data.blockedCount || 0) + count;
        const todayCount = (data.lastDate === today ? (data.blockedToday || 0) : 0) + count;
        chrome.storage.local.set({
          blockedCount: total,
          blockedToday: todayCount,
          lastDate: today
        });
      });
    }
  }

  // --------------------------------------------------------------------------
  // 3. INJEÇÃO DO BOTÃO DE EXPORTAÇÃO & MODAL COM COTA DIÁRIA (2/DIA FREE)
  // --------------------------------------------------------------------------
  const MAX_FREE_DAILY_EXPORTS = 2;

  function getDailyExportQuota(callback) {
    if (state.isPro) {
      callback({ isPro: true, count: 0, remaining: Infinity });
      return;
    }

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['exportsToday', 'exportsLastDate'], (data) => {
        const today = new Date().toDateString();
        const count = (data.exportsLastDate === today) ? (data.exportsToday || 0) : 0;
        const remaining = Math.max(0, MAX_FREE_DAILY_EXPORTS - count);
        callback({ isPro: false, count: count, remaining: remaining });
      });
    } else {
      callback({ isPro: false, count: 0, remaining: MAX_FREE_DAILY_EXPORTS });
    }
  }

  function incrementDailyExport() {
    if (state.isPro) return;
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['exportsToday', 'exportsLastDate'], (data) => {
        const today = new Date().toDateString();
        const current = (data.exportsLastDate === today) ? (data.exportsToday || 0) : 0;
        chrome.storage.local.set({
          exportsToday: current + 1,
          exportsLastDate: today
        });
      });
    }
  }

  function injectExportButtons() {
    if (!state.exportBtnEnabled) return;
    const t = CONTENT_I18N[state.appLanguage] || CONTENT_I18N.pt;

    // 1. Botão individual por resposta
    const actionBars = document.querySelectorAll('div[class*="items-center"][class*="gap-"]');
    actionBars.forEach((bar) => {
      if (bar.querySelector('.chatgpt-clean-export-btn')) return;
      if (bar.querySelector('button[aria-label*="Copy" i], button[aria-label*="Copiar" i], button[data-testid*="copy"]')) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'chatgpt-clean-export-btn';
        btn.innerHTML = `<span>📥</span><span>${t.exportBtn}</span>`;
        btn.title = t.exportBtnTitle;

        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const turnArticle = btn.closest('article') || btn.closest('[data-testid^="conversation-turn-"]');
          if (turnArticle) {
            const textNode = turnArticle.querySelector('.markdown') || turnArticle;
            const text = (textNode.innerText || '').trim();
            const html = (turnArticle.querySelector('.markdown')?.innerHTML || textNode.innerHTML || '');
            openExportModal(text, html, t.exportBtn);
          }
        });

        bar.appendChild(btn);
      }
    });

    // 2. Botão global no topo da conversa (Exportar Chat Completo)
    const headerControls = document.querySelector('header div[class*="flex"][class*="items-center"]') ||
                           document.querySelector('main header') ||
                           document.querySelector('[data-testid="chat-header"]');
    if (headerControls && !document.querySelector('.chatgpt-clean-global-export-btn')) {
      const globalBtn = document.createElement('button');
      globalBtn.type = 'button';
      globalBtn.className = 'chatgpt-clean-global-export-btn';
      globalBtn.innerHTML = `<span>📑</span><span>${t.exportFullBtn}</span>`;
      globalBtn.title = t.exportFullBtnTitle;

      globalBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        exportFullConversation();
      });

      headerControls.appendChild(globalBtn);
    }
  }

  function exportFullConversation() {
    const turns = document.querySelectorAll('article, [data-testid^="conversation-turn-"]');
    const t = CONTENT_I18N[state.appLanguage] || CONTENT_I18N.pt;
    if (!turns || turns.length === 0) {
      showToast('⚠️ Nenhuma mensagem encontrada para exportar.');
      return;
    }

    let fullMarkdown = `# Conversa ChatGPT - ${new Date().toLocaleDateString()}\n\n`;
    let fullHtml = `<h2>Conversa ChatGPT (${new Date().toLocaleDateString()})</h2><hr/>`;

    turns.forEach((turn, idx) => {
      const isUser = turn.querySelector('[data-message-author-role="user"]') || (idx % 2 === 0);
      const speaker = isUser ? '👤 User' : '🤖 ChatGPT';
      const textNode = turn.querySelector('.markdown') || turn;
      const text = (textNode.innerText || '').trim();
      const html = turn.querySelector('.markdown')?.innerHTML || textNode.innerHTML;

      fullMarkdown += `### ${speaker}:\n${text}\n\n---\n\n`;
      fullHtml += `<div style="margin-bottom:18px;"><strong>${speaker}:</strong><div style="margin-top:4px;">${html}</div></div><hr style="border:0;border-top:1px solid #eee;"/>`;
    });

    openExportModal(fullMarkdown, fullHtml, t.exportFullBtn);
  }

  // Abre o Modal com as 3 opções de exportação ou o Paywall de Limite Atingido
  function openExportModal(cleanText, formattedHtml, titleSuffix) {
    const t = CONTENT_I18N[state.appLanguage] || CONTENT_I18N.pt;
    getDailyExportQuota((quota) => {
      const existing = document.querySelector('.chatgpt-clean-modal-overlay');
      if (existing) existing.remove();

      const overlay = document.createElement('div');
      overlay.className = 'chatgpt-clean-modal-overlay';

      // Se atingiu o limite de 2 por dia no modo Free -> Mostrar Paywall PRO
      if (!quota.isPro && quota.remaining <= 0) {
        overlay.innerHTML = `
          <div class="chatgpt-clean-export-modal chatgpt-clean-pro-limit-modal">
            <div class="chatgpt-clean-export-modal-header">
              <h3>${t.limitModalTitle}</h3>
              <button class="chatgpt-clean-modal-close" id="chatgpt-clean-close-export">✕</button>
            </div>
            <div class="chatgpt-clean-limit-content">
              <div class="limit-crown-icon">👑</div>
              <h4>${t.limitModalHeading}</h4>
              <p>${t.limitModalDesc}</p>
              
              <div class="limit-offer-card">
                <span class="offer-title">${t.limitOfferTitle}</span>
                <p class="offer-desc">${t.limitOfferDesc}</p>
                <div class="offer-pricing">
                  <span class="old-price">9,99€</span>
                  <span class="current-price">2,99€</span>
                  <span class="badge-single">${t.limitSinglePay}</span>
                </div>
                <a href="https://buy.stripe.com/exemplo_link_checkout" target="_blank" class="limit-upgrade-btn">
                  ${t.limitUpgradeBtn}
                </a>
              </div>
            </div>
          </div>
        `;
      } else {
        // Modal Normal de Exportação com indicador de cota (2/dia)
        const quotaBadge = quota.isPro 
          ? `<span class="export-quota-tag tag-pro">${t.exportQuotaBadgePro}</span>`
          : `<span class="export-quota-tag">${t.exportQuotaBadge(quota.remaining)}</span>`;

        overlay.innerHTML = `
          <div class="chatgpt-clean-export-modal">
            <div class="chatgpt-clean-export-modal-header">
              <div class="header-left-group">
                <h3>${t.exportModalHeading(titleSuffix)}</h3>
                ${quotaBadge}
              </div>
              <button class="chatgpt-clean-modal-close" id="chatgpt-clean-close-export">✕</button>
            </div>
            <div class="chatgpt-clean-export-grid">
              <div class="chatgpt-clean-export-card" data-format="pdf">
                <span class="icon">📄</span>
                <div class="info">
                  <strong>${t.cardPdfTitle}</strong>
                  <span>${t.cardPdfDesc}</span>
                </div>
              </div>
              <div class="chatgpt-clean-export-card" data-format="word">
                <span class="icon">📝</span>
                <div class="info">
                  <strong>${t.cardWordTitle}</strong>
                  <span>${t.cardWordDesc}</span>
                </div>
              </div>
              <div class="chatgpt-clean-export-card" data-format="md">
                <span class="icon">📑</span>
                <div class="info">
                  <strong>${t.cardMdTitle}</strong>
                  <span>${t.cardMdDesc}</span>
                </div>
              </div>
            </div>
          </div>
        `;
      }

      document.body.appendChild(overlay);

      overlay.querySelector('#chatgpt-clean-close-export').addEventListener('click', () => overlay.remove());
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
      });

      overlay.querySelectorAll('.chatgpt-clean-export-card').forEach(card => {
        card.addEventListener('click', () => {
          const format = card.getAttribute('data-format');
          overlay.remove();
          incrementDailyExport();
          executeExport(cleanText, formattedHtml, format);
        });
      });
    });
  }



  function executeExport(text, htmlSnippet, format) {
    const timestamp = new Date().toISOString().slice(0, 10);

    if (format === 'md') {
      downloadFile(text, `chatgpt-export-${timestamp}.md`, 'text/markdown;charset=utf-8');
      showToast('✅ Ficheiro Markdown (.md) descarregado!');
    } else if (format === 'word') {
      const htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>Exportação ChatGPT</title>
        <style>
          body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #111; }
          h1, h2, h3 { color: #1e293b; }
          pre, code { background: #f1f5f9; font-family: Consolas, monospace; font-size: 10pt; padding: 4px; }
          blockquote { border-left: 3px solid #6366f1; margin: 8px 0; padding-left: 10px; color: #475569; }
        </style>
        </head><body>
        <h2>ChatGPT Export • ${timestamp}</h2>
        <hr/>
        <div>${htmlSnippet || escapeHtml(text).replace(/\n/g, '<br/>')}</div>
        </body></html>
      `;
      downloadFile(htmlContent, `chatgpt-export-${timestamp}.doc`, 'application/msword;charset=utf-8');
      showToast(t.exportToastWord);
    } else if (format === 'pdf') {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>ChatGPT Export - ${timestamp}</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; max-width: 800px; margin: auto; }
              h1 { font-size: 20px; color: #0f172a; border-bottom: 2px solid #6366f1; padding-bottom: 8px; margin-bottom: 20px; }
              pre, code { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; font-family: monospace; font-size: 13px; white-space: pre-wrap; word-break: break-word; }
              p { margin-bottom: 12px; }
              @media print { body { padding: 15px; } }
            </style>
          </head>
          <body>
            <h1>ChatGPT Export • ${timestamp}</h1>
            <div>${htmlSnippet || `<pre>${escapeHtml(text)}</pre>`}</div>
            <script>
              window.onload = function() {
                setTimeout(function() { window.print(); }, 200);
              };
            </script>
          </body>
          </html>
        `);
        printWindow.document.close();
        showToast(t.exportToastPdf || '🖨️ PDF');
      } else {
        showToast('⚠️ Permite popups no browser para imprimir em PDF.');
      }
    }
  }

  function downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // --------------------------------------------------------------------------
  // 4. GESTOR DE PASTAS FUNCIONAL NA BARRA LATERAL (BOOKMARKS DE CONVERSAS)
  // --------------------------------------------------------------------------
  function injectSidebarFolders() {
    if (!state.foldersEnabled) return;
    if (document.querySelector('.chatgpt-clean-folders-container')) return;

    // Seletores para encontrar o topo da barra lateral esquerda do ChatGPT
    const sidebarNav = document.querySelector('nav[aria-label*="hist" i]') ||
                       document.querySelector('nav[aria-label*="chat" i]') ||
                       document.querySelector('nav') ||
                       document.querySelector('#sidebar') ||
                       document.querySelector('div[class*="sidebar"] nav') ||
                       document.querySelector('div[class*="overflow-y-auto"]');
    if (!sidebarNav) return;

    const t = CONTENT_I18N[state.appLanguage] || CONTENT_I18N.pt;
    const container = document.createElement('div');
    container.className = 'chatgpt-clean-folders-container';

    let foldersHtml = '';
    state.folders.forEach(f => {
      const chatsList = f.chats || [];
      let chatsHtml = '';
      chatsList.forEach(chat => {
        chatsHtml += `
          <div class="chatgpt-clean-saved-chat" data-url="${escapeHtml(chat.url)}">
            <span class="chat-title" title="${escapeHtml(chat.title)}">💬 ${escapeHtml(chat.title)}</span>
            <button class="btn-delete-saved-chat" data-chat-id="${chat.id}" data-folder-id="${f.id}" title="Remover">✕</button>
          </div>
        `;
      });

      foldersHtml += `
        <div class="chatgpt-clean-folder-wrapper" data-folder-id="${f.id}">
          <div class="chatgpt-clean-folder-item">
            <div class="chatgpt-clean-folder-title">
              <span class="folder-name-toggle">▶ ${escapeHtml(f.name)}</span>
              <div class="folder-actions">
                <button class="btn-save-current-chat" data-folder-id="${f.id}" title="Guardar a conversa aberta nesta pasta">${t.btnPinChat}</button>
                <span class="chatgpt-clean-folder-count">${chatsList.length}</span>
              </div>
            </div>
          </div>
          <div class="chatgpt-clean-folder-chats" style="display: none;">
            ${chatsHtml || `<div class="no-chats-hint">${t.noChatSaved}</div>`}
          </div>
        </div>
      `;
    });

    container.innerHTML = `
      <div class="chatgpt-clean-folders-header">
        <span>${t.foldersHeader}</span>
        <button type="button" class="chatgpt-clean-add-folder-btn" id="chatgpt-clean-btn-new-folder">${t.btnAddFolder}</button>
      </div>
      <div class="chatgpt-clean-folder-list">
        ${foldersHtml}
      </div>
    `;

    sidebarNav.insertBefore(container, sidebarNav.firstChild);

    // Criar nova pasta
    const addBtn = container.querySelector('#chatgpt-clean-btn-new-folder');
    if (addBtn) {
      addBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const folderName = prompt(t.promptNewFolderName, '📁 Projetos');
        if (folderName && folderName.trim()) {
          const newFolder = {
            id: 'f_' + Date.now(),
            name: folderName.trim(),
            chats: []
          };
          state.folders.push(newFolder);
          saveFolders();
          container.remove();
          injectSidebarFolders();
          showToast(t.toastFolderCreated);
        }
      });
    }

    // Expandir/colapsar pasta
    container.querySelectorAll('.folder-name-toggle').forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const wrapper = toggle.closest('.chatgpt-clean-folder-wrapper');
        const chatsBox = wrapper.querySelector('.chatgpt-clean-folder-chats');
        const isHidden = chatsBox.style.display === 'none';
        chatsBox.style.display = isHidden ? 'block' : 'none';
        toggle.innerText = isHidden ? toggle.innerText.replace('▶', '▼') : toggle.innerText.replace('▼', '▶');
      });
    });

    // Guardar conversa atual na pasta
    container.querySelectorAll('.btn-save-current-chat').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const folderId = btn.getAttribute('data-folder-id');
        const folder = state.folders.find(f => f.id === folderId);
        if (!folder) return;

        if (!folder.chats) folder.chats = [];
        
        const currentUrl = window.location.href;
        const currentTitle = document.title.replace('- ChatGPT', '').trim() || 'Conversa ChatGPT';

        // Evitar duplicados
        const exists = folder.chats.some(c => c.url === currentUrl);
        if (exists) {
          showToast('ℹ️ Esta conversa já está guardada nesta pasta.');
          return;
        }

        folder.chats.push({
          id: 'c_' + Date.now(),
          title: currentTitle.slice(0, 32),
          url: currentUrl,
          date: new Date().toLocaleDateString()
        });

        saveFolders();
        container.remove();
        injectSidebarFolders();
        showToast(t.toastChatSaved);
      });
    });

    // Abrir conversa guardada ao clicar
    container.querySelectorAll('.chatgpt-clean-saved-chat').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-delete-saved-chat')) return;
        const url = item.getAttribute('data-url');
        if (url) window.location.href = url;
      });
    });

    // Remover conversa guardada
    container.querySelectorAll('.btn-delete-saved-chat').forEach(delBtn => {
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const folderId = delBtn.getAttribute('data-folder-id');
        const chatId = delBtn.getAttribute('data-chat-id');
        const folder = state.folders.find(f => f.id === folderId);
        if (folder && folder.chats) {
          folder.chats = folder.chats.filter(c => c.id !== chatId);
          saveFolders();
          container.remove();
          injectSidebarFolders();
          showToast(t.toastFolderDeleted);
        }
      });
    });
  }

  function saveFolders() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ folders: state.folders });
    }
  }

  // --------------------------------------------------------------------------
  // 5. INJEÇÃO DE PROMPTS RÁPIDOS (BOTÃO ⚡ JUNTO AO INPUT)
  // --------------------------------------------------------------------------
  function injectPromptTrigger() {
    if (!state.promptsEnabled) return;
    if (document.querySelector('.chatgpt-clean-prompt-trigger')) return;
    const t = CONTENT_I18N[state.appLanguage] || CONTENT_I18N.pt;

    const promptContainer = document.querySelector('form div[class*="flex"][class*="items-end"]') ||
                            document.querySelector('#prompt-textarea')?.parentElement ||
                            document.querySelector('form');

    if (promptContainer && !promptContainer.querySelector('.chatgpt-clean-prompt-trigger')) {
      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'chatgpt-clean-prompt-trigger';
      trigger.innerHTML = `⚡`;
      trigger.title = `ChatGPT Clean: ${t.quickPromptsTooltip}`;
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        togglePromptsModal();
      });

      promptContainer.insertBefore(trigger, promptContainer.firstChild);
    }
  }

  function togglePromptsModal() {
    const existing = document.querySelector('.chatgpt-clean-prompts-modal');
    if (existing) {
      existing.remove();
      return;
    }

    const t = CONTENT_I18N[state.appLanguage] || CONTENT_I18N.pt;
    const modal = document.createElement('div');
    modal.className = 'chatgpt-clean-prompts-modal';

    const promptsList = (state.customPrompts && state.customPrompts.length > 0)
      ? state.customPrompts
      : [
          {
            title: "⚡ Resumir em Bullet Points",
            text: "Por favor, resume o texto anterior em tópicos claros, diretos e objetivos (bullet points), destacando apenas os pontos mais importantes."
          },
          {
            title: "✍️ Melhorar e Corrigir Texto",
            text: "Revê e melhora o seguinte texto, corrigindo erros gramaticais e tornando a linguagem mais fluida e profissional:\n\n"
          },
          {
            title: "💻 Explicar Código Passo a Passo",
            text: "Analisa o código abaixo e explica linha por linha como funciona, apontando possíveis melhorias ou bugs:\n\n"
          }
        ];

    let itemsHtml = '';
    promptsList.forEach((p, idx) => {
      itemsHtml += `
        <div class="chatgpt-clean-prompt-item" data-index="${idx}">
          <div class="chatgpt-clean-prompt-title">${escapeHtml(p.title)}</div>
          <div class="chatgpt-clean-prompt-text">${escapeHtml(p.text)}</div>
        </div>
      `;
    });

    modal.innerHTML = `
      <div class="chatgpt-clean-prompts-header">
        <span>⚡ ${t.quickPromptsTooltip}</span>
        <button class="chatgpt-clean-prompts-close" id="chatgpt-clean-close-modal">✕</button>
      </div>
      <div class="chatgpt-clean-prompts-list">
        ${itemsHtml}
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('chatgpt-clean-close-modal').addEventListener('click', () => {
      modal.remove();
    });

    modal.querySelectorAll('.chatgpt-clean-prompt-item').forEach((item) => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.getAttribute('data-index'), 10);
        const selected = promptsList[idx];
        if (selected) {
          insertPromptIntoInput(selected.text);
          modal.remove();
          showToast(t.promptInserted);
        }
      });
    });
  }

  // Inserção Robusta: Funciona em <textarea> e div[contenteditable="true"] (ProseMirror do ChatGPT)
  function insertPromptIntoInput(text) {
    const inputElement = document.querySelector('#prompt-textarea') ||
                         document.querySelector('div[contenteditable="true"]') ||
                         document.querySelector('textarea');

    if (!inputElement) {
      navigator.clipboard.writeText(text);
      showToast('📋 Copiado! (Cola no chat com Ctrl+V)');
      return;
    }

    inputElement.focus();

    if (inputElement.isContentEditable || inputElement.getAttribute('contenteditable') === 'true') {
      // Método 1: Usar execCommand para simular digitação nativa no ProseMirror
      const success = document.execCommand('insertText', false, text);
      if (!success) {
        // Fallback para injeção em nós de parágrafo internos
        let p = inputElement.querySelector('p');
        if (!p) {
          p = document.createElement('p');
          inputElement.appendChild(p);
        }
        p.innerText = text;
        inputElement.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } else {
      inputElement.value = text;
      inputElement.dispatchEvent(new Event('input', { bubbles: true }));
      inputElement.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function showToast(msg) {
    const existing = document.querySelector('.chatgpt-clean-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'chatgpt-clean-toast';
    toast.innerText = msg;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  function escapeHtml(str) {
    return (str || '').replace(/[&<>"']/g, function(m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  function injectTools() {
    injectExportButtons();
    injectPromptTrigger();
    injectSidebarFolders();
  }

  // --------------------------------------------------------------------------
  // 6. OBSERVER DINÂMICO
  // --------------------------------------------------------------------------
  let scanScheduled = false;
  const observer = new MutationObserver(() => {
    if (!scanScheduled) {
      scanScheduled = true;
      requestAnimationFrame(() => {
        if (state.adBlockEnabled) {
          cleanAds();
        }
        injectTools();
        scanScheduled = false;
      });
    }
  });

  function init() {
    loadSettings();
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
      if (state.adBlockEnabled) cleanAds();
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        observer.observe(document.body, { childList: true, subtree: true });
        if (state.adBlockEnabled) cleanAds();
      });
    }
  }

  init();
})();
