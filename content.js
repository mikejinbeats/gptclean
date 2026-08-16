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
    appLanguage: 'en',
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
      exportToastMd: "Ficheiro Markdown (.md) descarregado!",
      exportToastWord: "Ficheiro Word (.doc) descarregado!",
      exportToastPdf: "Ficheiro PDF (.pdf) descarregado!",
      exportProgressTitle: "A preparar exportação...",
      exportProgressScanning: "A analisar histórico da conversa...",
      exportProgressFormatting: "A formatar mensagens e código...",
      exportProgressGenerating: (fmt) => `A compilar documento ${fmt}...`,
      exportProgressDone: "Concluído! A iniciar transferência...",
      promptInserted: "Prompt inserido no ChatGPT!",
      quickPromptsTooltip: "Prompts Rápidos",
      defaultFolders: { f1: '💼 Trabalho', f2: '💡 Ideias', f3: '📚 Estudos' },
      foldersHeader: "Pastas & Favoritos",
      btnAddFolder: "+ Nova Pasta",
      promptNewFolderName: "Nome da nova pasta:",
      toastFolderCreated: "Pasta criada com sucesso!",
      toastFolderDeleted: "Pasta eliminada!",
      btnPinChat: "📌 +Chat",
      noChatSaved: "Nenhum chat guardado ainda.",
      toastChatSaved: "Conversa guardada nesta pasta!",
      toastChatAlreadySaved: "Esta conversa já está guardada nesta pasta.",
      noMessagesToExport: "Nenhuma mensagem encontrada para exportar.",
      toastAllowPopups: "Permite popups no navegador para imprimir em PDF.",
      limitModalTitle: "Limite Diário Atingido",
      limitModalHeading: "Atingiste as tuas 2 exportações gratuitas de hoje!",
      limitModalDesc: "O teu limite de 2 exportações diárias reseta automaticamente amanhã à meia-noite.",
      limitOfferTitle: "Queres exportações infinitas?",
      limitOfferDesc: "Com o plano PRO tens exportações ilimitadas para sempre sem restrições de cota.",
      limitSinglePay: "Pagamento Único",
      limitUpgradeBtn: "Desbloquear Exportações Ilimitadas (2,99€)",
      exportModalHeading: (suffix) => suffix || "Exportar Conversa",
      exportQuotaBadge: (rem) => `Grátis: ${rem}/2 hoje`,
      exportQuotaBadgePro: "Ilimitado PRO",
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
      exportToastMd: "Markdown (.md) file downloaded!",
      exportToastWord: "Word (.doc) file downloaded!",
      exportToastPdf: "PDF (.pdf) file downloaded!",
      exportProgressTitle: "Preparing export...",
      exportProgressScanning: "Scanning conversation history...",
      exportProgressFormatting: "Formatting messages & code...",
      exportProgressGenerating: (fmt) => `Compiling ${fmt} document...`,
      exportProgressDone: "Done! Starting download / preview...",
      promptInserted: "Prompt inserted into ChatGPT!",
      quickPromptsTooltip: "Quick Prompts",
      defaultFolders: { f1: '💼 Work', f2: '💡 Ideas', f3: '📚 Studies' },
      foldersHeader: "Folders & Bookmarks",
      btnAddFolder: "+ New Folder",
      promptNewFolderName: "New folder name:",
      toastFolderCreated: "Folder created successfully!",
      toastFolderDeleted: "Folder deleted!",
      btnPinChat: "📌 +Chat",
      noChatSaved: "No chats saved yet.",
      toastChatSaved: "Conversation saved to this folder!",
      toastChatAlreadySaved: "This chat is already saved in this folder.",
      noMessagesToExport: "No messages found to export.",
      toastAllowPopups: "Please allow popups in your browser to print PDF.",
      limitModalTitle: "Daily Limit Reached",
      limitModalHeading: "You have reached your 2 free exports today!",
      limitModalDesc: "Your daily quota of 2 free exports will reset tomorrow at midnight.",
      limitOfferTitle: "Want unlimited exports?",
      limitOfferDesc: "With PRO plan you get lifetime unlimited exports without quota restrictions.",
      limitSinglePay: "One-Time Payment",
      limitUpgradeBtn: "Unlock Unlimited Exports ($2.99)",
      exportModalHeading: (suffix) => suffix || "Exportar Conversa",
      exportQuotaBadge: (rem) => `Free: ${rem}/2 today`,
      exportQuotaBadgePro: "PRO Unlimited",
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
      exportToastMd: "¡Archivo Markdown (.md) descargado!",
      exportToastWord: "¡Archivo Word (.doc) descargado!",
      exportToastPdf: "¡Archivo PDF (.pdf) descargado!",
      exportProgressTitle: "Preparando exportación...",
      exportProgressScanning: "Analizando historial de la conversación...",
      exportProgressFormatting: "Formateando mensajes y código...",
      exportProgressGenerating: (fmt) => `Compilando documento ${fmt}...`,
      exportProgressDone: "¡Listo! Iniciando descarga / vista previa...",
      promptInserted: "¡Prompt insertado en ChatGPT!",
      quickPromptsTooltip: "Prompts Rápidos",
      defaultFolders: { f1: '💼 Trabajo', f2: '💡 Ideas', f3: '📚 Estudios' },
      foldersHeader: "Carpetas y Favoritos",
      btnAddFolder: "+ Nueva Carpeta",
      promptNewFolderName: "Nombre de la nueva carpeta:",
      toastFolderCreated: "¡Carpeta creada con éxito!",
      toastFolderDeleted: "¡Carpeta eliminada!",
      btnPinChat: "📌 +Chat",
      noChatSaved: "Sin chats guardados aún.",
      toastChatSaved: "¡Conversación guardada en esta carpeta!",
      toastChatAlreadySaved: "Esta conversación ya está guardada en esta carpeta.",
      noMessagesToExport: "No se encontraron mensajes para exportar.",
      toastAllowPopups: "Por favor permite ventanas emergentes para imprimir en PDF.",
      limitModalTitle: "Límite Diario Alcanzado",
      limitModalHeading: "¡Has alcanzado tus 2 exportaciones gratuitas de hoy!",
      limitModalDesc: "Tu cuota diaria de 2 exportaciones se restablecerá mañana a medianoche.",
      limitOfferTitle: "¿Quieres exportaciones ilimitadas?",
      limitOfferDesc: "Con el plan PRO tienes exportaciones infinitas de por vida sin restricciones.",
      limitSinglePay: "Pago Único",
      limitUpgradeBtn: "Desbloquear Exportaciones Ilimitadas (2,99€)",
      exportModalHeading: (suffix) => suffix || "Exportar Conversa",
      exportQuotaBadge: (rem) => `Gratis: ${rem}/2 hoy`,
      exportQuotaBadgePro: "Ilimitado PRO",
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
      exportToastMd: "Fichier Markdown (.md) téléchargé !",
      exportToastWord: "Fichier Word (.doc) téléchargé !",
      exportToastPdf: "Fichier PDF (.pdf) téléchargé !",
      exportProgressTitle: "Préparation de l'export...",
      exportProgressScanning: "Analyse de l'historique...",
      exportProgressFormatting: "Formatage des messages et du code...",
      exportProgressGenerating: (fmt) => `Compilation du document ${fmt}...`,
      exportProgressDone: "Terminé ! Lancement du téléchargement...",
      promptInserted: "Prompt inséré dans ChatGPT !",
      quickPromptsTooltip: "Prompts Rapides",
      defaultFolders: { f1: '💼 Travail', f2: '💡 Idées', f3: '📚 Études' },
      foldersHeader: "Dossiers & Favoris",
      btnAddFolder: "+ Nouveau Dossier",
      promptNewFolderName: "Nom du nouveau dossier :",
      toastFolderCreated: "Dossier créé avec succès !",
      toastFolderDeleted: "Dossier supprimé !",
      btnPinChat: "📌 +Chat",
      noChatSaved: "Aucune discussion enregistrée.",
      toastChatSaved: "Discussion enregistrée dans ce dossier !",
      toastChatAlreadySaved: "Cette discussion est déjà enregistrée dans ce dossier.",
      noMessagesToExport: "Aucun message trouvé à exporter.",
      toastAllowPopups: "Veuillez autoriser les fenêtres contextuelles pour imprimer en PDF.",
      limitModalTitle: "Limite Quotidienne Atteinte",
      limitModalHeading: "Vous avez atteint vos 2 exports gratuits aujourd'hui !",
      limitModalDesc: "Votre quota de 2 exports quotidiens sera réinitialisé demain à minuit.",
      limitOfferTitle: "Vous voulez des exports illimités ?",
      limitOfferDesc: "Avec le forfait PRO, profitez d'exports illimités à vie sans aucune restriction.",
      limitSinglePay: "Paiement Unique",
      limitUpgradeBtn: "Débloquer les Exports Illimités (2,99€)",
      exportModalHeading: (suffix) => suffix || "Exportar Conversa",
      exportQuotaBadge: (rem) => `Gratuit : ${rem}/2 auj.`,
      exportQuotaBadgePro: "Illimité PRO",
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
      exportToastMd: "Markdown (.md) Datei heruntergeladen!",
      exportToastWord: "Word (.doc) Datei heruntergeladen!",
      exportToastPdf: "PDF (.pdf) Datei heruntergeladen!",
      exportProgressTitle: "Export wird vorbereitet...",
      exportProgressScanning: "Chat-Verlauf wird analysiert...",
      exportProgressFormatting: "Nachrichten & Code werden formatiert...",
      exportProgressGenerating: (fmt) => `${fmt}-Dokument wird kompiliert...`,
      exportProgressDone: "Fertig! Download / Vorschau gestartet...",
      promptInserted: "Prompt in ChatGPT eingefügt!",
      quickPromptsTooltip: "Schnelle Prompts",
      defaultFolders: { f1: '💼 Arbeit', f2: '💡 Ideen', f3: '📚 Studium' },
      foldersHeader: "Ordner & Lesezeichen",
      btnAddFolder: "+ Neuer Ordner",
      promptNewFolderName: "Name des neuen Ordners:",
      toastFolderCreated: "Ordner erfolgreich erstellt!",
      toastFolderDeleted: "Ordner gelöscht!",
      btnPinChat: "📌 +Chat",
      noChatSaved: "Noch keine Chats gespeichert.",
      toastChatSaved: "Chat in diesem Ordner gespeichert!",
      toastChatAlreadySaved: "Dieser Chat ist bereits in diesem Ordner gespeichert.",
      noMessagesToExport: "Keine Nachrichten zum Exportieren gefunden.",
      toastAllowPopups: "Bitte Popups im Browser erlauben, um PDF zu drucken.",
      limitModalTitle: "Tageslimit Erreicht",
      limitModalHeading: "Sie haben Ihre 2 kostenlosen Exporte für heute erreicht!",
      limitModalDesc: "Ihr tägliches Kontingent wird morgen um Mitternacht zurückgesetzt.",
      limitOfferTitle: "Möchten Sie unbegrenzte Exporte?",
      limitOfferDesc: "Mit dem PRO-Plan erhalten Sie lebenslang unbegrenzte Exporte ohne Limit.",
      limitSinglePay: "Einmalzahlung",
      limitUpgradeBtn: "Unbegrenzte Exporte Freischalten (2,99€)",
      exportModalHeading: (suffix) => suffix || "Exportar Conversa",
      exportQuotaBadge: (rem) => `Gratis: ${rem}/2 heute`,
      exportQuotaBadgePro: "Unbegrenzt PRO",
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
      exportToastMd: "File Markdown (.md) scaricato!",
      exportToastWord: "File Word (.doc) scaricato!",
      exportToastPdf: "File PDF (.pdf) scaricato!",
      exportProgressTitle: "Preparazione esportazione...",
      exportProgressScanning: "Analisi della cronologia...",
      exportProgressFormatting: "Formattazione messaggi e codice...",
      exportProgressGenerating: (fmt) => `Compilazione documento ${fmt}...`,
      exportProgressDone: "Fatto! Avvio download / anteprima...",
      promptInserted: "Prompt inserito in ChatGPT!",
      quickPromptsTooltip: "Prompt Rapidi",
      defaultFolders: { f1: '💼 Lavoro', f2: '💡 Idee', f3: '📚 Studio' },
      foldersHeader: "Cartelle e Segnalibri",
      btnAddFolder: "+ Nuova Cartella",
      promptNewFolderName: "Nome della nuova cartella:",
      toastFolderCreated: "Cartella creata con successo!",
      toastFolderDeleted: "Cartella eliminata!",
      btnPinChat: "📌 +Chat",
      noChatSaved: "Nessuna chat salvata.",
      toastChatSaved: "Chat salvata in questa cartella!",
      toastChatAlreadySaved: "Questa chat è già salvata in questa cartella.",
      noMessagesToExport: "Nessun messaggio trovato da esportare.",
      toastAllowPopups: "Consenti i popup nel browser per stampare in PDF.",
      limitModalTitle: "Limite Giornaliero Raggiunto",
      limitModalHeading: "Hai raggiunto le tue 2 esportazioni gratuite di oggi!",
      limitModalDesc: "La tua quota giornaliera di 2 esportazioni si resetterà domani a mezzanotte.",
      limitOfferTitle: "Vuoi esportazioni infinite?",
      limitOfferDesc: "Con il piano PRO hai esportazioni illimitate a vita senza restrizioni.",
      limitSinglePay: "Pagamento Singolo",
      limitUpgradeBtn: "Sblocca Esportazioni Illimitate (2,99€)",
      exportModalHeading: (suffix) => suffix || "Exportar Conversa",
      exportQuotaBadge: (rem) => `Gratis: ${rem}/2 oggi`,
      exportQuotaBadgePro: "Illimitato PRO",
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
      exportToastMd: "Markdown (.md) 文件已成功下载！",
      exportToastWord: "Word (.doc) 文档已成功下载！",
      exportToastPdf: "PDF (.pdf) 高清文件已成功下载！",
      exportProgressTitle: "正在准备导出...",
      exportProgressScanning: "正在解析会话历史内容...",
      exportProgressFormatting: "正在排版消息与代码块结构...",
      exportProgressGenerating: (fmt) => `正在生成 ${fmt} 高清文件...`,
      exportProgressDone: "准备就绪！正在启动下载/预览...",
      promptInserted: "提示词已成功插入输入框！",
      quickPromptsTooltip: "快捷提示词",
      defaultFolders: { f1: '💼 工作', f2: '💡 灵感', f3: '📚 学习' },
      foldersHeader: "侧边栏分类文件夹",
      btnAddFolder: "+ 新建文件夹",
      promptNewFolderName: "请输入新文件夹名称：",
      toastFolderCreated: "文件夹创建成功！",
      toastFolderDeleted: "文件夹已删除！",
      btnPinChat: "📌 +收藏",
      noChatSaved: "暂无收藏对话。",
      toastChatSaved: "当前对话已成功收藏至此文件夹！",
      toastChatAlreadySaved: "此对话已保存在此文件夹中。",
      noMessagesToExport: "未找到可导出的对话内容。",
      toastAllowPopups: "请在浏览器中允许弹窗以打印PDF。",
      limitModalTitle: "今日免费导出额度已用尽",
      limitModalHeading: "您今日的2次免费导出额度已达上限！",
      limitModalDesc: "每日2次免费额度将于明日零点自动刷新重置。",
      limitOfferTitle: "想要无限制极速导出？",
      limitOfferDesc: "升级PRO专业版，即可永久解锁终身无限次全格式导出特权。",
      limitSinglePay: "一次性买断",
      limitUpgradeBtn: "立即解锁无限导出 (2.99€)",
      exportModalHeading: (suffix) => suffix || "Exportar Conversa",
      exportQuotaBadge: (rem) => `今日剩余: ${rem}/2`,
      exportQuotaBadgePro: "终身PRO无限",
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
      exportToastMd: "Markdown (.md) ファイルをダウンロードしました！",
      exportToastWord: "Word (.doc) ファイルをダウンロードしました！",
      exportToastPdf: "PDF (.pdf) ファイルをダウンロードしました！",
      exportProgressTitle: "エクスポートを準備中...",
      exportProgressScanning: "会話履歴を解析中...",
      exportProgressFormatting: "メッセージとコードを整形中...",
      exportProgressGenerating: (fmt) => `${fmt} ドキュメントを生成中...`,
      exportProgressDone: "完了！ダウンロード・プレビューを開始...",
      promptInserted: "プロンプトを入力欄に挿入しました！",
      quickPromptsTooltip: "クイックプロンプト",
      defaultFolders: { f1: '💼 仕事', f2: '💡 アイデア', f3: '📚 学習' },
      foldersHeader: "フォルダ＆お気に入り",
      btnAddFolder: "+ 新規フォルダ",
      promptNewFolderName: "新しいフォルダ名を入力：",
      toastFolderCreated: "フォルダを作成しました！",
      toastFolderDeleted: "フォルダを削除しました！",
      btnPinChat: "📌 +保存",
      noChatSaved: "保存されたチャットはありません。",
      toastChatSaved: "このフォルダにチャットを保存しました！",
      toastChatAlreadySaved: "このチャットは既にこのフォルダに保存されています。",
      noMessagesToExport: "エクスポートするメッセージが見つかりません。",
      toastAllowPopups: "PDF印刷用にブラウザのポップアップを許可してください。",
      limitModalTitle: "本日の無料枠上限に達しました",
      limitModalHeading: "本日の2回無料エクスポートを使い切りました！",
      limitModalDesc: "1日2回の無料利用枠は明日の午前0時に自動リセットされます。",
      limitOfferTitle: "無制限で利用したいですか？",
      limitOfferDesc: "PROプランなら回数制限なしで永久に無制限エクスポートが可能です。",
      limitSinglePay: "買い切りプラン",
      limitUpgradeBtn: "無制限エクスポートを解放 (2.99€)",
      exportModalHeading: (suffix) => suffix || "Exportar Conversa",
      exportQuotaBadge: (rem) => `本日残り: ${rem}/2`,
      exportQuotaBadgePro: "永久PRO無制限",
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
        document.querySelectorAll('.chatgpt-clean-export-btn, .chatgpt-clean-global-export-btn, .chatgpt-clean-folders-container, .chatgpt-clean-prompt-bar, .chatgpt-clean-prompt-trigger').forEach(el => el.remove());
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
  const DOMAIN_QUOTA_KEY = '__cgpt_clean_export_q__';

  function readDomainQuota() {
    try {
      const raw = localStorage.getItem(DOMAIN_QUOTA_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  }

  function writeDomainQuota(dateStr, count) {
    try {
      localStorage.setItem(DOMAIN_QUOTA_KEY, JSON.stringify({ date: dateStr, count: count }));
    } catch (e) {}
  }

  function getDailyExportQuota(callback) {
    const today = new Date().toDateString();

    // 1. Verificar localStorage no domínio chatgpt.com (persiste mesmo ao reinstalar extensão)
    const domainQuota = readDomainQuota();
    let domainCount = (domainQuota && domainQuota.date === today) ? (domainQuota.count || 0) : 0;

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['exportsToday', 'exportsLastDate', 'isPro'], (localData) => {
        const syncStorage = chrome.storage.sync || chrome.storage.local;
        syncStorage.get(['exportsToday', 'exportsLastDate', 'isPro'], (syncData) => {
          const isPro = !!(localData?.isPro || syncData?.isPro || state.isPro);
          state.isPro = isPro;

          if (isPro) {
            callback({ isPro: true, count: 0, remaining: Infinity });
            return;
          }

          const localCount = (localData && localData.exportsLastDate === today) ? (localData.exportsToday || 0) : 0;
          const syncCount = (syncData && syncData.exportsLastDate === today) ? (syncData.exportsToday || 0) : 0;

          // Selecionar a contagem mais alta registrada entre as 3 camadas para impedir burla
          const effectiveCount = Math.max(domainCount, localCount, syncCount);
          const remaining = Math.max(0, MAX_FREE_DAILY_EXPORTS - effectiveCount);

          // Sincronizar todas as camadas
          if (localCount !== effectiveCount || syncCount !== effectiveCount || domainCount !== effectiveCount) {
            writeDomainQuota(today, effectiveCount);
            chrome.storage.local.set({ exportsToday: effectiveCount, exportsLastDate: today });
            if (chrome.storage.sync) {
              chrome.storage.sync.set({ exportsToday: effectiveCount, exportsLastDate: today });
            }
          }

          callback({ isPro: false, count: effectiveCount, remaining: remaining });
        });
      });
    } else {
      const remaining = Math.max(0, MAX_FREE_DAILY_EXPORTS - domainCount);
      callback({ isPro: state.isPro, count: domainCount, remaining: remaining });
    }
  }

  function incrementDailyExport() {
    if (state.isPro) return;
    const today = new Date().toDateString();

    getDailyExportQuota((quota) => {
      if (quota.isPro) return;
      const newCount = quota.count + 1;

      // Gravar simultaneamente nas 3 camadas
      writeDomainQuota(today, newCount);

      if (typeof chrome !== 'undefined' && chrome.storage) {
        if (chrome.storage.local) {
          chrome.storage.local.set({ exportsToday: newCount, exportsLastDate: today });
        }
        if (chrome.storage.sync) {
          chrome.storage.sync.set({ exportsToday: newCount, exportsLastDate: today });
        }
      }
    });
  }

  function injectExportButtons() {
    if (!state.exportBtnEnabled) return;
    const t = CONTENT_I18N[state.appLanguage] || CONTENT_I18N.en;
    const downloadIconUrl = chrome.runtime.getURL('icons/icons8-downloads-folder-94.png');
    const notebookIconUrl = chrome.runtime.getURL('icons/3dicons-notebook-dynamic-color.png');

    // 1. Botão individual por resposta
    const actionBars = document.querySelectorAll('div[class*="items-center"][class*="gap-"]');
    actionBars.forEach((bar) => {
      if (bar.querySelector('.chatgpt-clean-export-btn')) return;
      if (bar.querySelector('button[aria-label*="Copy" i], button[aria-label*="Copiar" i], button[data-testid*="copy"]')) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'chatgpt-clean-export-btn';
        btn.innerHTML = `<img src="${downloadIconUrl}" class="chat-btn-3d-icon" alt="Export"><span>${t.exportBtn}</span>`;
        btn.title = t.exportBtnTitle;

        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const turnArticle = btn.closest('article') || btn.closest('[data-testid^="conversation-turn-"]');
          if (turnArticle) {
            const textNode = turnArticle.querySelector('.markdown') || turnArticle;
            const text = (textNode.innerText || '').trim();
            const html = (turnArticle.querySelector('.markdown')?.innerHTML || textNode.innerHTML || '');
            openExportModal(text, html, false);
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
      globalBtn.innerHTML = `<img src="${notebookIconUrl}" class="chat-btn-3d-icon" alt="Export All"><span>${t.exportFullBtn}</span>`;
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
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['appLanguage'], (items) => {
        if (items && items.appLanguage) state.appLanguage = items.appLanguage;
        runExportFullConversation();
      });
    } else {
      runExportFullConversation();
    }
  }

  function runExportFullConversation() {
    const turns = document.querySelectorAll('article, [data-testid^="conversation-turn-"]');
    const t = CONTENT_I18N[state.appLanguage] || CONTENT_I18N.pt;
    if (!turns || turns.length === 0) {
      showToast(t.noMessagesToExport, 'warning');
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
      fullHtml += `<div class="chat-turn-block" style="margin-bottom:18px;page-break-inside:avoid;break-inside:avoid;"><strong>${speaker}:</strong><div style="margin-top:4px;">${html}</div></div><hr style="border:0;border-top:1px solid #eee;"/>`;
    });

    openExportModal(fullMarkdown, fullHtml, true);
  }

  // Abre o Modal com as 3 opções de exportação ou o Paywall de Limite Atingido
  function openExportModal(cleanText, formattedHtml, isFullChat) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['appLanguage', 'isPro'], (items) => {
        if (items && items.appLanguage) state.appLanguage = items.appLanguage;
        if (items && items.isPro !== undefined) state.isPro = items.isPro;
        renderModalWithQuota(cleanText, formattedHtml, isFullChat);
      });
    } else {
      renderModalWithQuota(cleanText, formattedHtml, isFullChat);
    }
  }

  function renderModalWithQuota(cleanText, formattedHtml, isFullChat) {
    const t = CONTENT_I18N[state.appLanguage] || CONTENT_I18N.pt;
    const modalTitle = isFullChat ? t.exportFullBtn : t.exportBtn;

    getDailyExportQuota((quota) => {
      const existing = document.querySelector('.chatgpt-clean-modal-overlay');
      if (existing) existing.remove();

      const overlay = document.createElement('div');
      overlay.className = 'chatgpt-clean-modal-overlay';

      const lockIconUrl = chrome.runtime.getURL('icons/icons8-lock-94.png');
      const crownIconUrl = chrome.runtime.getURL('icons/icons8-crown-100.png');
      const rocketIconUrl = chrome.runtime.getURL('icons/icons8-rocket-94.png');
      const downloadIconUrl = chrome.runtime.getURL('icons/icons8-downloads-folder-94.png');
      const giftIconUrl = chrome.runtime.getURL('icons/icones ua/icons8-gift-94.png');
      const pdfIconUrl = chrome.runtime.getURL('icons/icones ua/pdf.png');
      const docIconUrl = chrome.runtime.getURL('icons/icones ua/doc.png');
      const mdIconUrl = chrome.runtime.getURL('icons/icones ua/markdown.png');

      // Se atingiu o limite de 2 por dia no modo Free -> Mostrar Paywall PRO
      if (!quota.isPro && quota.remaining <= 0) {
        overlay.innerHTML = `
          <div class="chatgpt-clean-export-modal chatgpt-clean-pro-limit-modal">
            <div class="chatgpt-clean-export-modal-header">
              <div class="header-left-group" style="display:flex;align-items:center;gap:8px;">
                <img src="${lockIconUrl}" class="chatgpt-clean-modal-header-icon" alt="Lock">
                <h3>${t.limitModalTitle}</h3>
              </div>
              <button class="chatgpt-clean-modal-close" id="chatgpt-clean-close-export">✕</button>
            </div>
            <div class="chatgpt-clean-limit-content">
              <img src="${crownIconUrl}" class="chatgpt-clean-modal-3d-crown" alt="PRO Crown">
              <h4>${t.limitModalHeading}</h4>
              <p>${t.limitModalDesc}</p>
              
              <div class="limit-offer-card">
                <div class="limit-offer-header">
                  <img src="${rocketIconUrl}" class="limit-offer-3d-rocket" alt="Rocket">
                  <span class="offer-title">${t.limitOfferTitle}</span>
                </div>
                <p class="offer-desc">${t.limitOfferDesc}</p>
                <div class="offer-pricing">
                  <span class="old-price">9,99€</span>
                  <span class="current-price">2,99€</span>
                  <span class="badge-single">${t.limitSinglePay}</span>
                </div>
                <a href="https://buy.stripe.com/exemplo_link_checkout" target="_blank" class="limit-upgrade-btn">
                  <img src="${crownIconUrl}" class="limit-btn-3d-crown" alt="Crown">
                  <span>${t.limitUpgradeBtn}</span>
                </a>
              </div>
            </div>
          </div>
        `;
      } else {
        // Modal Normal de Exportação com indicador de cota (2/dia) e ícone de presente
        const quotaBadge = quota.isPro 
          ? `<span class="export-quota-tag tag-pro"><img src="${crownIconUrl}" class="badge-gift-icon" alt="PRO"> <span>${t.exportQuotaBadgePro}</span></span>`
          : `<span class="export-quota-tag"><img src="${giftIconUrl}" class="badge-gift-icon" alt="Gift"> <span>${t.exportQuotaBadge(quota.remaining)}</span></span>`;

        overlay.innerHTML = `
          <div class="chatgpt-clean-export-modal">
            <div class="chatgpt-clean-export-modal-header">
              <div class="header-left-group" style="display:flex;align-items:center;gap:8px;">
                <img src="${downloadIconUrl}" class="chatgpt-clean-modal-header-icon" alt="Export">
                <h3>${modalTitle}</h3>
                ${quotaBadge}
              </div>
              <button class="chatgpt-clean-modal-close" id="chatgpt-clean-close-export">✕</button>
            </div>
            <div class="chatgpt-clean-export-grid">
              <div class="chatgpt-clean-export-card" data-format="pdf">
                <img src="${pdfIconUrl}" class="export-card-3d-icon" alt="PDF">
                <div class="info">
                  <strong>${t.cardPdfTitle}</strong>
                  <span>${t.cardPdfDesc}</span>
                </div>
              </div>
              <div class="chatgpt-clean-export-card" data-format="word">
                <img src="${docIconUrl}" class="export-card-3d-icon" alt="Word">
                <div class="info">
                  <strong>${t.cardWordTitle}</strong>
                  <span>${t.cardWordDesc}</span>
                </div>
              </div>
              <div class="chatgpt-clean-export-card" data-format="md">
                <img src="${mdIconUrl}" class="export-card-3d-icon" alt="Markdown">
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



  function showExportProgress(format, onComplete) {
    const t = CONTENT_I18N[state.appLanguage] || CONTENT_I18N.pt;
    const existing = document.querySelector('.chatgpt-clean-progress-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'chatgpt-clean-progress-overlay';

    const rocketIconUrl = chrome.runtime.getURL('icons/icons8-rocket-94.png');
    const tickIconUrl = chrome.runtime.getURL('icons/3dicons-tick-dynamic-color.png');

    overlay.innerHTML = `
      <div class="chatgpt-clean-progress-card">
        <img src="${rocketIconUrl}" class="progress-card-3d-icon" id="progress-card-icon" alt="Processando">
        <h3 class="progress-card-title">${t.exportProgressTitle}</h3>
        <p class="progress-card-status" id="progress-step-text">${t.exportProgressScanning}</p>
        
        <div class="progress-bar-track">
          <div class="progress-bar-fill" id="progress-bar-fill" style="width: 15%;"></div>
        </div>
        <div class="progress-percentage-label" id="progress-pct-text">15%</div>
      </div>
    `;

    document.body.appendChild(overlay);

    const stepText = overlay.querySelector('#progress-step-text');
    const barFill = overlay.querySelector('#progress-bar-fill');
    const pctText = overlay.querySelector('#progress-pct-text');
    const cardIcon = overlay.querySelector('#progress-card-icon');

    // Estágio 1: 15% -> 50%
    setTimeout(() => {
      if (barFill) barFill.style.width = '50%';
      if (pctText) pctText.innerText = '50%';
      if (stepText) stepText.innerText = t.exportProgressFormatting;
    }, 280);

    // Estágio 2: 50% -> 85%
    setTimeout(() => {
      if (barFill) barFill.style.width = '85%';
      if (pctText) pctText.innerText = '85%';
      if (stepText) stepText.innerText = t.exportProgressGenerating(format.toUpperCase());
    }, 560);

    // Estágio 3: 100% Concluído
    setTimeout(() => {
      if (barFill) barFill.style.width = '100%';
      if (pctText) pctText.innerText = '100%';
      if (stepText) stepText.innerText = t.exportProgressDone;
      if (cardIcon) cardIcon.src = tickIconUrl;

      setTimeout(() => {
        overlay.classList.add('fade-out');
        setTimeout(() => overlay.remove(), 250);
        onComplete();
      }, 400);
    }, 900);
  }

  function executeExport(text, htmlSnippet, format) {
    const timestamp = new Date().toISOString().slice(0, 10);
    const t = CONTENT_I18N[state.appLanguage] || CONTENT_I18N.pt;

    showExportProgress(format, () => {
      if (format === 'md') {
        downloadFile(text, `chatgpt-export-${timestamp}.md`, 'text/markdown;charset=utf-8');
        showToast(t.exportToastMd || 'Ficheiro Markdown (.md) descarregado!', 'success');
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
        showToast(t.exportToastWord || 'Ficheiro Word (.doc) descarregado!', 'success');
      } else if (format === 'pdf') {
        try {
          const jsPDFClass = (typeof jspdf !== 'undefined' && jspdf.jsPDF) 
            ? jspdf.jsPDF 
            : (window.jspdf ? window.jspdf.jsPDF : (typeof jsPDF !== 'undefined' ? jsPDF : null));

          if (jsPDFClass) {
            const doc = new jsPDFClass({
              orientation: 'portrait',
              unit: 'mm',
              format: 'a4'
            });

            const pageWidth = 210;
            const pageHeight = 297;
            const margin = 16;
            const maxWidth = pageWidth - (margin * 2);
            const bottomLimit = pageHeight - margin - 8;

            let y = margin;

            // Title Header
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(16);
            doc.setTextColor(15, 23, 42);
            doc.text(`ChatGPT Export • ${timestamp}`, margin, y);
            y += 6;

            // Accent Line
            doc.setDrawColor(99, 102, 241);
            doc.setLineWidth(0.8);
            doc.line(margin, y, margin + maxWidth, y);
            y += 10;

            // Parse conversation turns
            const rawSections = text.split(/\n\n---\n\n/);
            const turns = [];

            rawSections.forEach((sec, idx) => {
              const trimmed = sec.trim();
              if (!trimmed) return;
              if (trimmed.startsWith('# Conversa ChatGPT')) {
                const rest = trimmed.replace(/^# Conversa[^\n]*\n*/, '').trim();
                if (rest) {
                  const isUser = rest.includes('👤 User') || (idx % 2 === 0);
                  const cleanBody = rest.replace(/^###\s*(👤\s*User|🤖\s*ChatGPT):\s*/i, '').trim();
                  turns.push({
                    isUser: isUser,
                    text: cleanBody || rest
                  });
                }
                return;
              }

              const isUser = trimmed.includes('👤 User') || (idx % 2 === 0);
              const cleanBody = trimmed.replace(/^###\s*(👤\s*User|🤖\s*ChatGPT):\s*/i, '').trim();
              turns.push({
                isUser: isUser,
                text: cleanBody || trimmed
              });
            });

            if (turns.length === 0) {
              turns.push({
                isUser: false,
                text: text
              });
            }

            turns.forEach((turn, idx) => {
              if (y + 15 > bottomLimit) {
                doc.addPage();
                y = margin;
              }

              // Role Badge
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(11);
              if (turn.isUser) {
                doc.setTextColor(37, 99, 235);
                doc.text('👤 User', margin, y);
              } else {
                doc.setTextColor(79, 70, 229);
                doc.text('🤖 ChatGPT', margin, y);
              }
              y += 5;

              // Message text
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(10);
              doc.setTextColor(30, 41, 59);

              const lines = doc.splitTextToSize(turn.text, maxWidth);
              lines.forEach(line => {
                if (y + 5 > bottomLimit) {
                  doc.addPage();
                  y = margin;
                }
                doc.text(line, margin, y);
                y += 4.8;
              });

              y += 4;

              // Separator between turns
              if (idx < turns.length - 1) {
                if (y + 6 > bottomLimit) {
                  doc.addPage();
                  y = margin;
                }
                doc.setDrawColor(226, 232, 240);
                doc.setLineWidth(0.3);
                doc.line(margin, y, margin + maxWidth, y);
                y += 7;
              }
            });

            // Page numbers
            const totalPages = doc.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
              doc.setPage(i);
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(8);
              doc.setTextColor(148, 163, 184);
              doc.text('ChatGPT Clean Export', margin, pageHeight - 10);
              doc.text(`${i} / ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
            }

            const pdfBlob = doc.output('blob');
            downloadFile(pdfBlob, `chatgpt-export-${timestamp}.pdf`, 'application/pdf');
            showToast(t.exportToastPdf || 'Ficheiro PDF (.pdf) descarregado!', 'success');
          } else {
            throw new Error('jsPDF instance not found');
          }
        } catch (err) {
          console.error('PDF export error:', err);
          downloadFile(text, `chatgpt-export-${timestamp}.md`, 'text/markdown;charset=utf-8');
          showToast('Ficheiro descarregado com sucesso!', 'success');
        }
      }
    });
  }

  function downloadFile(content, fileName, mimeType) {
    const blob = (content instanceof Blob) ? content : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
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

    const folderIconUrl = chrome.runtime.getURL('icons/icons8-folder-94.png');
    container.innerHTML = `
      <div class="chatgpt-clean-folders-header">
        <div class="folders-header-left" style="display:flex;align-items:center;gap:6px;">
          <img src="${folderIconUrl}" class="folders-3d-icon" alt="Folders">
          <span>${t.foldersHeader}</span>
        </div>
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
          showToast(t.toastChatAlreadySaved || 'Esta conversa já está guardada nesta pasta.', 'warning');
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
        showToast(t.toastChatSaved, 'success');
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
          showToast(t.toastFolderDeleted, 'warning');
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
  // 5. INJEÇÃO DE PROMPTS RÁPIDOS (BARRA POSICIONADA ACIMA DA CAIXA DE INPUT)
  // --------------------------------------------------------------------------
  const DEFAULT_PROMPTS_BY_LANG = {
    pt: [
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
    ],
    en: [
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
    ],
    es: [
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
        title: "Explicar Código Passo a Paso",
        desc: "Comenta línea por línea y sugiere optimizaciones.",
        text: "Analiza el siguiente código y explica línea por línea cómo funciona, señalando posibles fallos o mejoras:\n\n"
      }
    ],
    fr: [
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
    ],
    de: [
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
    ],
    it: [
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
    ],
    zh: [
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
    ],
    ja: [
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
  };

  function injectPromptTrigger() {
    if (!state.promptsEnabled) return;
    if (document.querySelector('.chatgpt-clean-prompt-bar')) return;

    // Remover qualquer trigger antigo solto
    const oldTrigger = document.querySelector('.chatgpt-clean-prompt-trigger');
    if (oldTrigger) oldTrigger.remove();

    const inputContainer = document.querySelector('form') ||
                           document.querySelector('#prompt-textarea')?.closest('form') ||
                           document.querySelector('#prompt-textarea')?.closest('div[class*="composer"]') ||
                           document.querySelector('#prompt-textarea')?.parentElement?.parentElement ||
                           document.querySelector('div[class*="ProseMirror"]')?.closest('form') ||
                           document.querySelector('div[class*="ProseMirror"]')?.parentElement?.parentElement ||
                           document.querySelector('main form');

    if (!inputContainer) return;

    const lang = state.appLanguage || 'en';
    const t = CONTENT_I18N[lang] || CONTENT_I18N.pt;
    const lightningIconUrl = chrome.runtime.getURL('icons/icons8-lightning-94.png');

    const bar = document.createElement('div');
    bar.className = 'chatgpt-clean-prompt-bar';

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'chatgpt-clean-prompt-trigger-pill';
    trigger.innerHTML = `
      <img src="${lightningIconUrl}" class="chat-prompt-trigger-icon" alt="Prompts">
      <span>${t.quickPromptsTooltip}</span>
    `;
    trigger.title = `ChatGPT Clean: ${t.quickPromptsTooltip}`;
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      togglePromptsModal();
    });

    bar.appendChild(trigger);
    inputContainer.insertAdjacentElement('beforebegin', bar);
  }

  function togglePromptsModal() {
    const existing = document.querySelector('.chatgpt-clean-prompts-modal');
    if (existing) {
      existing.remove();
      return;
    }

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['appLanguage', 'customPrompts'], (items) => {
        if (items && items.appLanguage) state.appLanguage = items.appLanguage;
        if (items && items.customPrompts) state.customPrompts = items.customPrompts;
        renderPromptsModal();
      });
    } else {
      renderPromptsModal();
    }
  }

  function renderPromptsModal() {
    const lang = state.appLanguage || 'en';
    const t = CONTENT_I18N[lang] || CONTENT_I18N.pt;
    const modal = document.createElement('div');
    modal.className = 'chatgpt-clean-prompts-modal';

    const lightningIconUrl = chrome.runtime.getURL('icons/icons8-lightning-94.png');
    const writeIconUrl = chrome.runtime.getURL('icons/icons8-write-94.png');
    const computerIconUrl = chrome.runtime.getURL('icons/icons8-computer-94.png');

    const defaultList = DEFAULT_PROMPTS_BY_LANG[lang] || DEFAULT_PROMPTS_BY_LANG.en;
    const icons = [lightningIconUrl, writeIconUrl, computerIconUrl];

    let promptsList = defaultList.map((p, idx) => ({
      icon: icons[idx % icons.length] || lightningIconUrl,
      title: p.title,
      text: p.text
    }));

    if (state.customPrompts && state.customPrompts.length > 0) {
      const customItems = state.customPrompts.map(p => ({
        icon: lightningIconUrl,
        title: p.title,
        text: p.text
      }));
      promptsList = [...customItems, ...promptsList];
    }

    let itemsHtml = '';
    promptsList.forEach((p, idx) => {
      itemsHtml += `
        <div class="chatgpt-clean-prompt-item" data-index="${idx}">
          <div class="prompt-item-content" style="display:flex;align-items:center;gap:10px;">
            <img src="${p.icon || lightningIconUrl}" class="prompt-item-3d-icon" alt="Prompt" style="width:20px;height:20px;object-fit:contain;flex-shrink:0;">
            <div style="flex:1;min-width:0;">
              <div class="chatgpt-clean-prompt-title">${escapeHtml(p.title)}</div>
              <div class="chatgpt-clean-prompt-text">${escapeHtml(p.text)}</div>
            </div>
          </div>
        </div>
      `;
    });

    modal.innerHTML = `
      <div class="chatgpt-clean-prompts-header">
        <div style="display:flex;align-items:center;gap:7px;">
          <img src="${lightningIconUrl}" alt="Prompts" style="width:16px;height:16px;object-fit:contain;">
          <span>${t.quickPromptsTooltip}</span>
        </div>
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
          showToast(t.promptInserted, 'success');
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

  function showToast(msg, iconType = 'success') {
    const existing = document.querySelector('.chatgpt-clean-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `chatgpt-clean-toast ${iconType === 'warning' ? 'toast-warning' : 'toast-success'}`;

    let iconSrc = 'icons/3dicons-tick-dynamic-color.png';
    if (iconType === 'warning') {
      iconSrc = 'icons/warning.png';
    }
    const iconUrl = chrome.runtime.getURL(iconSrc);

    toast.innerHTML = `
      <img src="${iconUrl}" class="toast-3d-icon" alt="${iconType}">
      <span>${escapeHtml(msg)}</span>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3200);
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
