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
      createFolderTitle: "Criar Nova Pasta",
      placeholderNewFolder: "Ex: 💼 Trabalho, 💡 Ideias, 📁 Projetos...",
      btnCreateFolder: "Criar Pasta",
      btnCancel: "Cancelar",
      btnDeleteFolder: "Eliminar Pasta",
      deleteFolderTitle: "Eliminar Pasta?",
      deleteFolderConfirmText: (name) => `Tens a certeza de que desejas eliminar a pasta "${name}" e todos os seus chats guardados?`,
      btnConfirmDelete: "Sim, Eliminar",
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
      btnAddFolder: "+ Nova",
      promptNewFolderName: "Nome da nova pasta:",
      toastFolderCreated: "Pasta criada com sucesso!",
      toastFolderDeleted: "Pasta eliminada!",
      btnPinChat: "📌 +Chat",
      noChatSaved: "Nenhum chat guardado ainda.",
      toastChatSaved: "Conversa guardada nesta pasta!",
      toastChatAlreadySaved: "Esta conversa já está guardada nesta pasta.",
      noMessagesToExport: "Nenhuma mensagem encontrada para exportar.",
      exportModalHeading: (suffix) => suffix || "Exportar Conversa",
      exportQuotaBadge: (rem) => `Grátis: ${rem}/2 hoje`,
      exportQuotaBadgePro: "Ilimitado PRO",
      cardPdfTitle: "Documento PDF (.pdf)",
      cardPdfDesc: "Layout formatado pronto para guardar ou imprimir",
      cardWordTitle: "Microsoft Word (.doc)",
      cardWordDesc: "Ideal para editar e partilhar relatórios",
      cardMdTitle: "Markdown (.md)",
      cardMdDesc: "Texto puro com blocos de código e formatação",
      limitModalTitle: "Limite Diário Atingido",
      limitModalHeading: "Atingiste as tuas 2 exportações gratuitas de hoje!",
      limitModalDesc: "Faz upgrade para o plano PRO Vitalício para exportar conversas completas em PDF, Word e Markdown sem limites.",
      limitOfferTitle: "Acesso PRO Vitalício (Oferta de Lançamento)",
      limitOfferDesc: "Pagamento único. Sem mensalidades nem renovações.",
      limitSinglePay: "PAGAMENTO ÚNICO",
      limitUpgradeBtn: "Desbloquear Exportações Ilimitadas"
    },
    en: {
      createFolderTitle: "Create New Folder",
      placeholderNewFolder: "e.g. 💼 Work, 💡 Ideas, 📁 Projects...",
      btnCreateFolder: "Create Folder",
      btnCancel: "Cancel",
      btnDeleteFolder: "Delete Folder",
      deleteFolderTitle: "Delete Folder?",
      deleteFolderConfirmText: (name) => `Are you sure you want to delete the folder "${name}" and all its saved chats?`,
      btnConfirmDelete: "Yes, Delete",
      exportBtn: "Export",
      exportBtnTitle: "Choose format to export (PDF, Word, Markdown)",
      exportFullBtn: "Export Full Chat",
      exportFullBtnTitle: "Export all questions and answers from this conversation",
      exportToastMd: "Markdown (.md) file downloaded!",
      exportToastWord: "Word (.doc) file downloaded!",
      exportToastPdf: "PDF (.pdf) file downloaded!",
      exportProgressTitle: "Preparing export...",
      exportProgressScanning: "Scanning conversation history...",
      exportProgressFormatting: "Formatting messages and code blocks...",
      exportProgressGenerating: (fmt) => `Generating ${fmt} document...`,
      exportProgressDone: "Done! Starting download...",
      promptInserted: "Prompt inserted into ChatGPT!",
      quickPromptsTooltip: "Quick Prompts",
      defaultFolders: { f1: '💼 Work', f2: '💡 Ideas', f3: '📚 Studies' },
      foldersHeader: "Folders & Bookmarks",
      btnAddFolder: "+ New",
      promptNewFolderName: "New folder name:",
      toastFolderCreated: "Folder created successfully!",
      toastFolderDeleted: "Folder deleted!",
      btnPinChat: "📌 +Chat",
      noChatSaved: "No chats saved yet.",
      toastChatSaved: "Conversation saved to this folder!",
      toastChatAlreadySaved: "This chat is already saved in this folder.",
      noMessagesToExport: "No messages found to export.",
      exportModalHeading: (suffix) => suffix || "Export Chat",
      exportQuotaBadge: (rem) => `Free: ${rem}/2 today`,
      exportQuotaBadgePro: "PRO Unlimited",
      cardPdfTitle: "PDF Document (.pdf)",
      cardPdfDesc: "Formatted layout ready for saving or printing",
      cardWordTitle: "Microsoft Word (.doc)",
      cardWordDesc: "Ideal for editing and sharing reports",
      cardMdTitle: "Markdown (.md)",
      cardMdDesc: "Clean text with code blocks and headers",
      limitModalTitle: "Daily Limit Reached",
      limitModalHeading: "You reached your 2 free daily exports!",
      limitModalDesc: "Upgrade to Lifetime PRO to export unlimited chats in PDF, Word and Markdown without limits.",
      limitOfferTitle: "Lifetime PRO Access (Launch Deal)",
      limitOfferDesc: "One-time payment. No subscriptions or renewals.",
      limitSinglePay: "ONE-TIME PAYMENT",
      limitUpgradeBtn: "Unlock Unlimited Exports"
    },
    es: {
      createFolderTitle: "Crear Nueva Carpeta",
      placeholderNewFolder: "Ej: 💼 Trabajo, 💡 Ideas, 📁 Proyectos...",
      btnCreateFolder: "Crear Carpeta",
      btnCancel: "Cancelar",
      btnDeleteFolder: "Eliminar Carpeta",
      deleteFolderTitle: "¿Eliminar Carpeta?",
      deleteFolderConfirmText: (name) => `¿Estás seguro de que deseas eliminar la carpeta "${name}" y todos sus chats guardados?`,
      btnConfirmDelete: "Sí, Eliminar",
      exportBtn: "Exportar",
      exportBtnTitle: "Elegir formato para exportar (PDF, Word, Markdown)",
      exportFullBtn: "Exportar Chat Completo",
      exportFullBtnTitle: "Exportar todas las preguntas y respuestas de esta conversación",
      exportToastMd: "¡Archivo Markdown (.md) descargado!",
      exportToastWord: "¡Archivo Word (.doc) descargado!",
      exportToastPdf: "¡Archivo PDF (.pdf) descargado!",
      exportProgressTitle: "Preparando exportación...",
      exportProgressScanning: "Escaneando historial de la conversación...",
      exportProgressFormatting: "Formateando mensajes y código...",
      exportProgressGenerating: (fmt) => `Generando documento ${fmt}...`,
      exportProgressDone: "¡Listo! Iniciando descarga...",
      promptInserted: "¡Prompt insertado en ChatGPT!",
      quickPromptsTooltip: "Prompts Rápidos",
      defaultFolders: { f1: '💼 Trabajo', f2: '💡 Ideas', f3: '📚 Estudios' },
      foldersHeader: "Carpetas y Favoritos",
      btnAddFolder: "+ Nueva",
      promptNewFolderName: "Nombre de la nueva carpeta:",
      toastFolderCreated: "¡Carpeta creada con éxito!",
      toastFolderDeleted: "¡Carpeta eliminada!",
      btnPinChat: "📌 +Chat",
      noChatSaved: "Sin chats guardados aún.",
      toastChatSaved: "¡Conversación guardada en esta carpeta!",
      toastChatAlreadySaved: "Esta conversación ya está guardada en esta carpeta.",
      noMessagesToExport: "No se encontraron mensajes para exportar.",
      exportModalHeading: (suffix) => suffix || "Exportar Conversación",
      exportQuotaBadge: (rem) => `Gratis: ${rem}/2 hoy`,
      exportQuotaBadgePro: "Ilimitado PRO",
      cardPdfTitle: "Documento PDF (.pdf)",
      cardPdfDesc: "Diseño formateado listo para guardar o imprimir",
      cardWordTitle: "Microsoft Word (.doc)",
      cardWordDesc: "Ideal para editar y compartir informes",
      cardMdTitle: "Markdown (.md)",
      cardMdDesc: "Texto limpio con bloques de código y formato",
      limitModalTitle: "Límite Diario Alcanzado",
      limitModalHeading: "¡Has alcanzado tus 2 exportaciones gratuitas de hoy!",
      limitModalDesc: "Actualiza a Lifetime PRO para exportar chats completos en PDF, Word y Markdown sin límites.",
      limitOfferTitle: "Acceso Lifetime PRO (Oferta Especial)",
      limitOfferDesc: "Pago único. Sin suscripciones ni renovaciones.",
      limitSinglePay: "PAGO ÚNICO",
      limitUpgradeBtn: "Desbloquear Exportaciones Ilimitadas"
    },
    fr: {
      createFolderTitle: "Créer un Nouveau Dossier",
      placeholderNewFolder: "Ex : 💼 Travail, 💡 Idées, 📁 Projets...",
      btnCreateFolder: "Créer le Dossier",
      btnCancel: "Annuler",
      btnDeleteFolder: "Supprimer le Dossier",
      deleteFolderTitle: "Supprimer le Dossier ?",
      deleteFolderConfirmText: (name) => `Êtes-vous sûr de vouloir supprimer le dossier "${name}" et toutes ses discussions enregistrées ?`,
      btnConfirmDelete: "Oui, Supprimer",
      exportBtn: "Exporter",
      exportBtnTitle: "Choisir le format d'exportation (PDF, Word, Markdown)",
      exportFullBtn: "Exporter Tout le Chat",
      exportFullBtnTitle: "Exporter toutes les questions et réponses de cette discussion",
      exportToastMd: "Fichier Markdown (.md) téléchargé !",
      exportToastWord: "Fichier Word (.doc) téléchargé !",
      exportToastPdf: "Fichier PDF (.pdf) téléchargé !",
      exportProgressTitle: "Préparation de l'exportation...",
      exportProgressScanning: "Analyse de l'historique du chat...",
      exportProgressFormatting: "Mise en page des messages et du code...",
      exportProgressGenerating: (fmt) => `Génération du document ${fmt}...`,
      exportProgressDone: "Terminé ! Téléchargement en cours...",
      promptInserted: "Prompt inséré dans ChatGPT !",
      quickPromptsTooltip: "Prompts Rapides",
      defaultFolders: { f1: '💼 Travail', f2: '💡 Idées', f3: '📚 Études' },
      foldersHeader: "Dossiers & Favoris",
      btnAddFolder: "+ Nouveau",
      promptNewFolderName: "Nom du nouveau dossier :",
      toastFolderCreated: "Dossier créé avec succès !",
      toastFolderDeleted: "Dossier supprimé !",
      btnPinChat: "📌 +Chat",
      noChatSaved: "Aucune discussion enregistrée.",
      toastChatSaved: "Discussion enregistrée dans ce dossier !",
      toastChatAlreadySaved: "Cette discussion est déjà enregistrée dans ce dossier.",
      noMessagesToExport: "Aucun message trouvé à exporter.",
      exportModalHeading: (suffix) => suffix || "Exporter la Discussion",
      exportQuotaBadge: (rem) => `Gratuit : ${rem}/2 auj.`,
      exportQuotaBadgePro: "Illimité PRO",
      cardPdfTitle: "Document PDF (.pdf)",
      cardPdfDesc: "Mise en page prête pour impression ou archivage",
      cardWordTitle: "Microsoft Word (.doc)",
      cardWordDesc: "Idéal pour modifier et partager des rapports",
      cardMdTitle: "Markdown (.md)",
      cardMdDesc: "Texte pur avec blocs de code et titres",
      limitModalTitle: "Limite Quotidienne Atteinte",
      limitModalHeading: "Vous avez utilisé vos 2 exports gratuits aujourd'hui !",
      limitModalDesc: "Passez à la version PRO à Vie pour exporter des conversations illimitées en PDF, Word et Markdown.",
      limitOfferTitle: "Accès PRO à Vie (Offre de Lancement)",
      limitOfferDesc: "Paiement unique. Sans abonnement ni renouvellement.",
      limitSinglePay: "PAIEMENT UNIQUE",
      limitUpgradeBtn: "Débloquer les Exports Illimités"
    },
    de: {
      createFolderTitle: "Neuen Ordner Erstellen",
      placeholderNewFolder: "z.B. 💼 Arbeit, 💡 Ideen, 📁 Projekte...",
      btnCreateFolder: "Ordner Erstellen",
      btnCancel: "Abbrechen",
      btnDeleteFolder: "Ordner Löschen",
      deleteFolderTitle: "Ordner Löschen?",
      deleteFolderConfirmText: (name) => `Möchten Sie den Ordner "${name}" und alle darin gespeicherten Chats wirklich löschen?`,
      btnConfirmDelete: "Ja, Löschen",
      exportBtn: "Exportieren",
      exportBtnTitle: "Format zum Exportieren wählen (PDF, Word, Markdown)",
      exportFullBtn: "Gesamten Chat Exportieren",
      exportFullBtnTitle: "Alle Fragen und Antworten dieses Chats exportieren",
      exportToastMd: "Markdown-Datei (.md) heruntergeladen!",
      exportToastWord: "Word-Datei (.doc) heruntergeladen!",
      exportToastPdf: "PDF-Datei (.pdf) heruntergeladen!",
      exportProgressTitle: "Export wird vorbereitet...",
      exportProgressScanning: "Chat-Verlauf wird analysiert...",
      exportProgressFormatting: "Nachrichten und Code werden formatiert...",
      exportProgressGenerating: (fmt) => `Dokument ${fmt} wird erstellt...`,
      exportProgressDone: "Fertig! Download startet...",
      promptInserted: "Prompt in ChatGPT eingefügt!",
      quickPromptsTooltip: "Schnelle Prompts",
      defaultFolders: { f1: '💼 Arbeit', f2: '💡 Ideen', f3: '📚 Studium' },
      foldersHeader: "Ordner & Favoriten",
      btnAddFolder: "+ Neu",
      promptNewFolderName: "Name des neuen Ordners:",
      toastFolderCreated: "Ordner erfolgreich erstellt!",
      toastFolderDeleted: "Ordner gelöscht!",
      btnPinChat: "📌 +Chat",
      noChatSaved: "Noch keine Chats gespeichert.",
      toastChatSaved: "Chat in diesem Ordner gespeichert!",
      toastChatAlreadySaved: "Dieser Chat ist bereits in diesem Ordner gespeichert.",
      noMessagesToExport: "Keine Nachrichten zum Exportieren gefunden.",
      exportModalHeading: (suffix) => suffix || "Chat Exportieren",
      exportQuotaBadge: (rem) => `Gratis: ${rem}/2 heute`,
      exportQuotaBadgePro: "Unbegrenzt PRO",
      cardPdfTitle: "PDF-Dokument (.pdf)",
      cardPdfDesc: "Formatiertes Layout bereit zum Speichern oder Drucken",
      cardWordTitle: "Microsoft Word (.doc)",
      cardWordDesc: "Ideal zum Bearbeiten und Weitergeben von Berichten",
      cardMdTitle: "Markdown (.md)",
      cardMdDesc: "Reiner Text mit Codeblöcken und Überschriften",
      limitModalTitle: "Tageslimit Erreicht",
      limitModalHeading: "Sie haben Ihre 2 kostenlosen täglichen Exporte aufgebraucht!",
      limitModalDesc: "Upgraden Sie auf Lifetime PRO für unbegrenzte Exporte in PDF, Word und Markdown.",
      limitOfferTitle: "Lifetime PRO Zugang (Einführungsangebot)",
      limitOfferDesc: "Einmalige Zahlung. Keine Abonnements oder Verlängerungen.",
      limitSinglePay: "EINMALIGE ZAHLUNG",
      limitUpgradeBtn: "Unbegrenzte Exporte Freischalten"
    },
    it: {
      createFolderTitle: "Crea Nuova Cartella",
      placeholderNewFolder: "Es: 💼 Lavoro, 💡 Idee, 📁 Progetti...",
      btnCreateFolder: "Crea Cartella",
      btnCancel: "Annulla",
      btnDeleteFolder: "Elimina Cartella",
      deleteFolderTitle: "Eliminare la Cartella?",
      deleteFolderConfirmText: (name) => `Sei sicuro di voler eliminare la cartella "${name}" e tutte le chat salvate?`,
      btnConfirmDelete: "Sì, Elimina",
      exportBtn: "Esporta",
      exportBtnTitle: "Scegli il formato da esportare (PDF, Word, Markdown)",
      exportFullBtn: "Esporta Chat Completa",
      exportFullBtnTitle: "Esporta tutte le domande e risposte di questa chat",
      exportToastMd: "File Markdown (.md) scaricato!",
      exportToastWord: "File Word (.doc) scaricato!",
      exportToastPdf: "File PDF (.pdf) scaricato!",
      exportProgressTitle: "Preparazione esportazione...",
      exportProgressScanning: "Scansione della cronologia chat...",
      exportProgressFormatting: "Formattazione messaggi e codice...",
      exportProgressGenerating: (fmt) => `Generazione documento ${fmt}...`,
      exportProgressDone: "Completato! Download in corso...",
      promptInserted: "Prompt inserito in ChatGPT!",
      quickPromptsTooltip: "Prompt Rapidi",
      defaultFolders: { f1: '💼 Lavoro', f2: '💡 Idee', f3: '📚 Studio' },
      foldersHeader: "Cartelle & Preferiti",
      btnAddFolder: "+ Nuova",
      promptNewFolderName: "Nome della nuova cartella:",
      toastFolderCreated: "Cartella creata con successo!",
      toastFolderDeleted: "Cartella eliminata!",
      btnPinChat: "📌 +Chat",
      noChatSaved: "Nessuna chat salvata.",
      toastChatSaved: "Chat salvata in questa cartella!",
      toastChatAlreadySaved: "Questa chat è già salvata in questa cartella.",
      noMessagesToExport: "Nessun messaggio trovato da esportare.",
      exportModalHeading: (suffix) => suffix || "Esporta Conversazione",
      exportQuotaBadge: (rem) => `Gratis: ${rem}/2 oggi`,
      exportQuotaBadgePro: "Illimitato PRO",
      cardPdfTitle: "Documento PDF (.pdf)",
      cardPdfDesc: "Layout formattato pronto per il salvataggio o la stampa",
      cardWordTitle: "Microsoft Word (.doc)",
      cardWordDesc: "Ideale per modificare e condividere report",
      cardMdTitle: "Markdown (.md)",
      cardMdDesc: "Testo pulito con blocchi di codice e titoli",
      limitModalTitle: "Limite Giornaliero Raggiunto",
      limitModalHeading: "Hai raggiunto le tue 2 esportazioni gratuite giornaliere!",
      limitModalDesc: "Passa a PRO a Vita per esportare chat illimitate in PDF, Word e Markdown senza limiti.",
      limitOfferTitle: "Accesso PRO a Vita (Offerta di Lancio)",
      limitOfferDesc: "Pagamento una tantum. Nessun abbonamento né rinnovo.",
      limitSinglePay: "PAGAMENTO UNICO",
      limitUpgradeBtn: "Sblocca Esportazioni Illimitate"
    },
    zh: {
      createFolderTitle: "新建侧边栏文件夹",
      placeholderNewFolder: "例如: 💼 工作, 💡 灵感, 📁 项目...",
      btnCreateFolder: "立即创建",
      btnCancel: "取消",
      btnDeleteFolder: "删除文件夹",
      deleteFolderTitle: "确认删除此文件夹？",
      deleteFolderConfirmText: (name) => `您确定要删除文件夹 "${name}" 及其所有收藏的对话吗？`,
      btnConfirmDelete: "确认删除",
      exportBtn: "导出",
      exportBtnTitle: "选择导出格式 (PDF, Word, Markdown)",
      exportFullBtn: "导出完整对话",
      exportFullBtnTitle: "导出当前对话的所有问答记录",
      exportToastMd: "Markdown (.md) 文件已下载！",
      exportToastWord: "Word (.doc) 文件已下载！",
      exportToastPdf: "PDF (.pdf) 文件已下载！",
      exportProgressTitle: "正在准备导出...",
      exportProgressScanning: "正在分析对话历史记录...",
      exportProgressFormatting: "正在排版消息与代码块...",
      exportProgressGenerating: (fmt) => `正在生成 ${fmt} 文档...`,
      exportProgressDone: "完成！正在开始下载...",
      promptInserted: "快捷指令已填入 ChatGPT！",
      quickPromptsTooltip: "快捷提示词",
      defaultFolders: { f1: '💼 工作', f2: '💡 灵感', f3: '📚 学习' },
      foldersHeader: "收藏与分类文件夹",
      btnAddFolder: "+ 新建",
      promptNewFolderName: "新文件夹名称:",
      toastFolderCreated: "文件夹创建成功！",
      toastFolderDeleted: "文件夹已删除！",
      btnPinChat: "📌 +对话",
      noChatSaved: "暂无保存的对话。",
      toastChatSaved: "对话已保存至此文件夹！",
      toastChatAlreadySaved: "此对话已保存在该文件夹中。",
      noMessagesToExport: "未找到可导出的对话内容。",
      exportModalHeading: (suffix) => suffix || "导出当前对话",
      exportQuotaBadge: (rem) => `今日剩余: ${rem}/2`,
      exportQuotaBadgePro: "终身PRO无限",
      cardPdfTitle: "PDF 文档 (.pdf)",
      cardPdfDesc: "格式精美，适合排版阅读或打印",
      cardWordTitle: "Microsoft Word 文档 (.doc)",
      cardWordDesc: "适合进一步编辑与团队汇报",
      cardMdTitle: "Markdown 文件 (.md)",
      cardMdDesc: "包含代码块与标题的原生格式",
      limitModalTitle: "已达到每日免费限额",
      limitModalHeading: "您今天 2 次免费导出额度已用完！",
      limitModalDesc: "升级至终身 PRO 版，即可无限制导出 PDF、Word 和 Markdown 文档。",
      limitOfferTitle: "终身 PRO 访问权限（首发特惠）",
      limitOfferDesc: "一次性购买，终身可用，无需月费续订。",
      limitSinglePay: "一次性买断",
      limitUpgradeBtn: "解锁无限导出权限"
    },
    ja: {
      createFolderTitle: "新規フォルダを作成",
      placeholderNewFolder: "例: 💼 仕事, 💡 アイデア, 📁 プロジェクト...",
      btnCreateFolder: "フォルダを作成",
      btnCancel: "キャンセル",
      btnDeleteFolder: "フォルダを削除",
      deleteFolderTitle: "フォルダを削除しますか？",
      deleteFolderConfirmText: (name) => `フォルダ「${name}」と保存されたチャットをすべて削除してもよろしいですか？`,
      btnConfirmDelete: "削除する",
      exportBtn: "エクスポート",
      exportBtnTitle: "形式を選択してエクスポート (PDF, Word, Markdown)",
      exportFullBtn: "チャット全体をエクスポート",
      exportFullBtnTitle: "この会話のすべての質疑応答を保存",
      exportToastMd: "Markdown (.md) ファイルをダウンロードしました！",
      exportToastWord: "Word (.doc) ファイルをダウンロードしました！",
      exportToastPdf: "PDF (.pdf) ファイルをダウンロードしました！",
      exportProgressTitle: "エクスポートを準備中...",
      exportProgressScanning: "チャット履歴をスキャンしています...",
      exportProgressFormatting: "メッセージとコードブロックを整形中...",
      exportProgressGenerating: (fmt) => `${fmt} ドキュメントを生成中...`,
      exportProgressDone: "完了！ダウンロードを開始します...",
      promptInserted: "プロンプトを ChatGPT に挿入しました！",
      quickPromptsTooltip: "クイックプロンプト",
      defaultFolders: { f1: '💼 仕事', f2: '💡 アイデア', f3: '📚 学習' },
      foldersHeader: "フォルダ＆ブックマーク",
      btnAddFolder: "+ 新規",
      promptNewFolderName: "新規フォルダ名:",
      toastFolderCreated: "フォルダを作成しました！",
      toastFolderDeleted: "フォルダを削除しました！",
      btnPinChat: "📌 +チャット",
      noChatSaved: "保存されたチャットはありません。",
      toastChatSaved: "チャットをフォルダに保存しました！",
      toastChatAlreadySaved: "このチャットは既に保存されています。",
      noMessagesToExport: "エクスポートするメッセージがありません。",
      exportModalHeading: (suffix) => suffix || "チャットをエクスポート",
      exportQuotaBadge: (rem) => `本日残り: ${rem}/2`,
      exportQuotaBadgePro: "永久PRO無制限",
      cardPdfTitle: "PDF ドキュメント (.pdf)",
      cardPdfDesc: "印刷や保存に最適なフォーマット済みレイアウト",
      cardWordTitle: "Microsoft Word (.doc)",
      cardWordDesc: "レポートの編集や共有に最適",
      cardMdTitle: "Markdown (.md)",
      cardMdDesc: "コードブロックと書式付きのプレーンテキスト",
      limitModalTitle: "本日の無料上限に達しました",
      limitModalHeading: "本日の無料エクスポート（2回）をすべて使用しました！",
      limitModalDesc: "永久 PRO 版にアップグレードすると、PDF、Word、Markdown で無制限にエクスポートできます。",
      limitOfferTitle: "永久 PRO アクセス（特別ローンチ価格）",
      limitOfferDesc: "買い切りプラン。月額料金や自動更新はありません。",
      limitSinglePay: "買い切り",
      limitUpgradeBtn: "無制限エクスポートをアンロック"
    }
  };

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
    // --------------------------------------------------------------------------
  // --------------------------------------------------------------------------
  // IDENTIFICAÇÃO E ISOLAMENTO MULTI-CONTAS (PLANO A)
  // --------------------------------------------------------------------------
  function getCurrentAccountId() {
    try {
      // 1. Procurar email ou identificador no botão de perfil
      const profileBtn = document.querySelector('[data-testid="profile-button"]') ||
                         document.querySelector('button[aria-haspopup="menu"][class*="w-full"]') ||
                         document.querySelector('nav div[class*="sticky"] button');
      if (profileBtn) {
        const textElements = profileBtn.querySelectorAll('div, span');
        for (let el of textElements) {
          const text = (el.innerText || '').trim();
          if (text && text.includes('@') && text.includes('.')) {
            return text.toLowerCase();
          }
        }
        const nameEl = profileBtn.querySelector('.truncate') || profileBtn.querySelector('div');
        if (nameEl && nameEl.innerText && nameEl.innerText.trim()) {
          const cleanName = nameEl.innerText.trim().toLowerCase();
          if (cleanName && cleanName !== 'perfil' && cleanName !== 'profile' && cleanName !== 'user') {
            return 'user_' + cleanName.replace(/[^a-z0-9]/g, '_');
          }
        }
      }

      // 2. Procurar em avatares com alt de utilizador ou email
      const avatarImg = document.querySelector('img[alt*="@"], img[alt*="avatar" i], img[alt*="User" i]');
      if (avatarImg && avatarImg.alt && avatarImg.alt.includes('@')) {
        return avatarImg.alt.trim().toLowerCase();
      }

      // 3. Fallback: procurar nos scripts de estado da página
      const scripts = document.querySelectorAll('script');
      for (let s of scripts) {
        if (s.textContent && s.textContent.includes('"email":"')) {
          const match = s.textContent.match(/"email":"([^"]+)"/);
          if (match && match[1]) return match[1].toLowerCase();
        }
        if (s.textContent && s.textContent.includes('"user_id":"')) {
          const match = s.textContent.match(/"user_id":"([^"]+)"/);
          if (match && match[1]) return match[1].toLowerCase();
        }
      }
    } catch (e) {}

    return state.currentAccountId || 'default_account';
  }

  function checkAccountSwitch() {
    const detected = getCurrentAccountId();
    if (detected && detected !== 'default_account' && detected !== state.currentAccountId) {
      console.log('ChatGPT Clean: Conta trocada detectada:', detected);
      state.currentAccountId = detected;
      const t = CONTENT_I18N[state.appLanguage] || CONTENT_I18N.pt;
      
      if (!state.foldersByAccount) state.foldersByAccount = {};
      if (state.foldersByAccount[detected]) {
        state.folders = state.foldersByAccount[detected];
      } else {
        state.folders = [
          { id: 'f1', name: t.defaultFolders.f1, chats: [] },
          { id: 'f2', name: t.defaultFolders.f2, chats: [] },
          { id: 'f3', name: t.defaultFolders.f3, chats: [] }
        ];
        state.foldersByAccount[detected] = state.folders;
      }
      
      const container = document.querySelector('.chatgpt-clean-folders-container');
      if (container) container.remove();
      injectSidebarFolders();
    }
  }

  // 4. GESTOR DE PASTAS FUNCIONAL NA BARRA LATERAL (BOOKMARKS DE CONVERSAS)
  // --------------------------------------------------------------------------
  function saveFolders() {
    const accountId = getCurrentAccountId();
    state.currentAccountId = accountId;
    if (!state.foldersByAccount) state.foldersByAccount = {};
    state.foldersByAccount[accountId] = state.folders;

    if (typeof chrome !== 'undefined' && chrome.storage) {
      if (chrome.storage.local) {
        chrome.storage.local.set({ 
          folders: state.folders,
          foldersByAccount: state.foldersByAccount 
        });
      }
      if (chrome.storage.sync) {
        chrome.storage.sync.set({ 
          folders: state.folders,
          foldersByAccount: state.foldersByAccount 
        });
      }
    }
    try {
      localStorage.setItem('__cgpt_clean_folders_data__', JSON.stringify(state.folders));
      localStorage.setItem('__cgpt_clean_folders_by_account__', JSON.stringify(state.foldersByAccount));
    } catch (e) {}
  }

  function openCreateFolderModal() {
    const t = CONTENT_I18N[state.appLanguage] || CONTENT_I18N.pt;
    const existing = document.querySelector('.chatgpt-clean-modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'chatgpt-clean-modal-overlay';

    const folderIconUrl = chrome.runtime.getURL('icons/icons8-folder-94.png');

    overlay.innerHTML = `
      <div class="chatgpt-clean-custom-modal">
        <div class="chatgpt-clean-custom-modal-header">
          <div style="display:flex;align-items:center;gap:8px;">
            <img src="${folderIconUrl}" style="width:22px;height:22px;object-fit:contain;" alt="Folder">
            <h3>${t.createFolderTitle || 'Criar Nova Pasta'}</h3>
          </div>
          <button class="chatgpt-clean-modal-close" id="chatgpt-clean-close-folder-modal">✕</button>
        </div>
        <form id="chatgpt-clean-new-folder-form">
          <input type="text" id="chatgpt-clean-folder-name-input" class="chatgpt-clean-folder-modal-input" placeholder="${t.placeholderNewFolder || 'Ex: 💼 Trabalho, 💡 Ideias...'}" value="📁 Projetos" required autofocus>
          <div class="chatgpt-clean-modal-actions">
            <button type="button" class="chatgpt-clean-btn-secondary" id="chatgpt-clean-btn-cancel-folder">${t.btnCancel || 'Cancelar'}</button>
            <button type="submit" class="chatgpt-clean-btn-primary">${t.btnCreateFolder || 'Criar Pasta'}</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    const input = overlay.querySelector('#chatgpt-clean-folder-name-input');
    if (input) {
      setTimeout(() => {
        input.focus();
        input.select();
      }, 50);
    }

    const closeModal = () => overlay.remove();
    overlay.querySelector('#chatgpt-clean-close-folder-modal').addEventListener('click', closeModal);
    overlay.querySelector('#chatgpt-clean-btn-cancel-folder').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    overlay.querySelector('#chatgpt-clean-new-folder-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const val = (input.value || '').trim();
      if (!val) return;

      const newFolderId = 'f_' + Date.now();
      const newFolder = {
        id: newFolderId,
        name: val,
        chats: []
      };
      state.folders.push(newFolder);
      if (!state.expandedFolderIds) state.expandedFolderIds = new Set();
      state.expandedFolderIds.add(newFolderId);

      saveFolders();
      closeModal();
      showToast(t.toastFolderCreated || 'Pasta criada com sucesso!', 'success');

      const container = document.querySelector('.chatgpt-clean-folders-container');
      if (container) container.remove();
      injectSidebarFolders();
    });
  }

  function openDeleteFolderConfirmModal(folderId, folderName) {
    const t = CONTENT_I18N[state.appLanguage] || CONTENT_I18N.pt;
    const existing = document.querySelector('.chatgpt-clean-modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'chatgpt-clean-modal-overlay';

    const warnIconUrl = chrome.runtime.getURL('icons/icones ua/warning.png');

    overlay.innerHTML = `
      <div class="chatgpt-clean-custom-modal">
        <div class="chatgpt-clean-custom-modal-header">
          <div style="display:flex;align-items:center;gap:8px;">
            <img src="${warnIconUrl}" style="width:22px;height:22px;object-fit:contain;" alt="Warning">
            <h3 style="color:#ef4444 !important;">${t.deleteFolderTitle || 'Eliminar Pasta?'}</h3>
          </div>
          <button class="chatgpt-clean-modal-close" id="chatgpt-clean-close-delete-modal">✕</button>
        </div>
        <p class="chatgpt-clean-modal-desc">${t.deleteFolderConfirmText ? t.deleteFolderConfirmText(folderName) : `Tens a certeza de que desejas eliminar a pasta "${folderName}" e todos os seus chats guardados?`}</p>
        <div class="chatgpt-clean-modal-actions">
          <button type="button" class="chatgpt-clean-btn-secondary" id="chatgpt-clean-btn-cancel-delete">${t.btnCancel || 'Cancelar'}</button>
          <button type="button" class="chatgpt-clean-btn-danger" id="chatgpt-clean-btn-confirm-delete">${t.btnConfirmDelete || 'Sim, Eliminar'}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const closeModal = () => overlay.remove();
    overlay.querySelector('#chatgpt-clean-close-delete-modal').addEventListener('click', closeModal);
    overlay.querySelector('#chatgpt-clean-btn-cancel-delete').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    overlay.querySelector('#chatgpt-clean-btn-confirm-delete').addEventListener('click', () => {
      state.folders = state.folders.filter(f => f.id !== folderId);
      if (state.expandedFolderIds) state.expandedFolderIds.delete(folderId);
      saveFolders();
      closeModal();
      showToast(t.toastFolderDeleted || 'Pasta eliminada!', 'success');

      const container = document.querySelector('.chatgpt-clean-folders-container');
      if (container) container.remove();
      injectSidebarFolders();
    });
  }

  // --------------------------------------------------------------------------
  // EXTRAÇÃO PRECISA DA CONVERSA ATIVA ATUALMENTE ABERTA
  // --------------------------------------------------------------------------
  function getActiveChatInfo() {
    const currentUrl = window.location.href;
    const currentPath = window.location.pathname;
    let chatTitle = '';

    // 1. Se estivermos num chat com ID (/c/UUID ou /g/.../c/UUID), procurar o item ativo correspondente na sidebar
    if (currentPath.includes('/c/')) {
      const uuid = currentPath.split('/c/')[1]?.split('?')[0]?.split('/')[0];
      if (uuid) {
        const matchingLink = document.querySelector(`nav a[href*="/c/${uuid}"]`);
        if (matchingLink) {
          const textEl = matchingLink.querySelector('.truncate, span, div');
          const txt = (textEl ? textEl.innerText : matchingLink.innerText).trim();
          if (txt && txt.length > 0 && txt.toLowerCase() !== 'chatgpt') {
            chatTitle = txt;
          }
        }
      }
    }

    // 2. Procurar no título do cabeçalho superior do ChatGPT (Top Header Bar)
    if (!chatTitle) {
      const headerTitleEl = document.querySelector('button[data-testid*="title" i]') ||
                            document.querySelector('header h1') ||
                            document.querySelector('main h1') ||
                            document.querySelector('header button[aria-haspopup="menu"] span') ||
                            document.querySelector('div[class*="text-token-text-primary"][class*="font-semibold"]');
      if (headerTitleEl) {
        const hText = headerTitleEl.innerText.trim();
        if (hText && !hText.toLowerCase().includes('chatgpt') && !hText.toLowerCase().includes('gpt-')) {
          chatTitle = hText;
        }
      }
    }

    // 3. Procurar a primeira mensagem enviada pelo utilizador nesta conversa
    if (!chatTitle) {
      const userMsgEl = document.querySelector('[data-message-author-role="user"]') ||
                        document.querySelector('article[data-testid*="conversation-turn"] [class*="whitespace-pre-wrap"]') ||
                        document.querySelector('div[data-testid*="user"]');
      if (userMsgEl) {
        const rawText = userMsgEl.innerText.trim().replace(/\n+/g, ' ');
        if (rawText && rawText.length > 0) {
          chatTitle = rawText.length > 40 ? rawText.slice(0, 38) + '...' : rawText;
        }
      }
    }

    // 4. Fallback para document.title
    if (!chatTitle) {
      const docTitle = document.title.replace(/ChatGPT/gi, '').replace(/^[-•\s:|]+/, '').trim();
      if (docTitle && docTitle.toLowerCase() !== 'chatgpt' && docTitle.toLowerCase() !== 'new chat') {
        chatTitle = docTitle;
      }
    }

    // 5. Fallback com data e hora se for uma conversa nova
    if (!chatTitle) {
      const now = new Date();
      chatTitle = 'Conversa ' + now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return { url: currentUrl, title: chatTitle };
  }

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
      const isExpanded = state.expandedFolderIds && state.expandedFolderIds.has(f.id);
      const displayStyle = isExpanded ? 'block' : 'none';

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
              <span class="folder-name-toggle" style="cursor:pointer;flex:1;display:flex;align-items:center;gap:4px;">
                <span class="folder-arrow-icon" style="font-size:10px;transition:transform 0.2s;${isExpanded ? 'transform:rotate(90deg);' : ''}">▶</span>
                <span>📁 ${escapeHtml(f.name)}</span>
              </span>
              <div class="folder-actions" style="display:flex;align-items:center;gap:4px;">
                <button class="btn-save-current-chat" data-folder-id="${f.id}" title="Guardar a conversa aberta nesta pasta">${t.btnPinChat}</button>
                <span class="chatgpt-clean-folder-count">${chatsList.length}</span>
                <button class="btn-delete-folder" data-folder-id="${f.id}" data-folder-name="${escapeHtml(f.name)}" title="${t.btnDeleteFolder || 'Eliminar Pasta'}">
                  <svg viewBox="0 0 24 24" width="13" height="13" stroke="#ef4444" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div class="chatgpt-clean-folder-chats" style="display: ${displayStyle};">
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

    // Criar nova pasta com Modal Customizado
    const addBtn = container.querySelector('#chatgpt-clean-btn-new-folder');
    if (addBtn) {
      addBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openCreateFolderModal();
      });
    }

    // Toggle abrir/fechar chats da pasta
    container.querySelectorAll('.folder-name-toggle').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const wrapper = el.closest('.chatgpt-clean-folder-wrapper');
        const folderId = wrapper.getAttribute('data-folder-id');
        const chatsContainer = wrapper.querySelector('.chatgpt-clean-folder-chats');
        const arrow = el.querySelector('.folder-arrow-icon');
        const isHidden = chatsContainer.style.display === 'none';

        chatsContainer.style.display = isHidden ? 'block' : 'none';
        if (arrow) arrow.style.transform = isHidden ? 'rotate(90deg)' : 'none';

        if (!state.expandedFolderIds) state.expandedFolderIds = new Set();
        if (isHidden) {
          state.expandedFolderIds.add(folderId);
        } else {
          state.expandedFolderIds.delete(folderId);
        }
      });
    });

        // Guardar conversa atual na pasta
    container.querySelectorAll('.btn-save-current-chat').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const folderId = btn.getAttribute('data-folder-id');
        
        const chatInfo = getActiveChatInfo();

        const folder = state.folders.find(f => f.id === folderId);
        if (folder) {
          if (!folder.chats) folder.chats = [];
          
          // Verificar se este chat exato já está guardado nesta pasta
          const exists = folder.chats.some(c => {
            if (chatInfo.url.includes('/c/') && c.url.includes('/c/')) {
              const u1 = chatInfo.url.split('/c/')[1]?.split('?')[0];
              const u2 = c.url.split('/c/')[1]?.split('?')[0];
              return u1 && u2 && u1 === u2;
            }
            return c.url === chatInfo.url && c.title === chatInfo.title;
          });

          if (!exists) {
            folder.chats.push({
              id: 'c_' + Date.now(),
              title: chatInfo.title,
              url: chatInfo.url,
              savedAt: new Date().toISOString()
            });

            // Expandir a pasta automaticamente para que a conversa guardada apareça visível!
            if (!state.expandedFolderIds) state.expandedFolderIds = new Set();
            state.expandedFolderIds.add(folderId);

            saveFolders();
            showToast(t.toastChatSaved, 'success');
            container.remove();
            injectSidebarFolders();
          } else {
            showToast(t.toastChatAlreadySaved, 'warning');
          }
        }
      });
    });

    // Eliminar pasta inteira com Confirmação (Sim / Não)
    container.querySelectorAll('.btn-delete-folder').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const folderId = btn.getAttribute('data-folder-id');
        const folderName = btn.getAttribute('data-folder-name');
        openDeleteFolderConfirmModal(folderId, folderName);
      });
    });

    // Abrir chat guardado
    container.querySelectorAll('.chatgpt-clean-saved-chat').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-delete-saved-chat')) return;
        const url = item.getAttribute('data-url');
        if (url && url.startsWith('http')) {
          window.location.href = url;
        }
      });
    });

    // Eliminar chat guardado individual
    container.querySelectorAll('.btn-delete-saved-chat').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const folderId = btn.getAttribute('data-folder-id');
        const chatId = btn.getAttribute('data-chat-id');

        const folder = state.folders.find(f => f.id === folderId);
        if (folder && folder.chats) {
          folder.chats = folder.chats.filter(c => c.id !== chatId);
          saveFolders();
          container.remove();
          injectSidebarFolders();
        }
      });
    });
  }

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
