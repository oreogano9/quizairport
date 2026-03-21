export interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
  imageUrl?: string; // path relative to /public
}

export const QUESTIONS: Question[] = [
  // ── DEFINIZIONI ─────────────────────────────────────────────────────────────
  {
    id: "def-01",
    question: "Cosa si intende per «Airside»?",
    options: [
      "Tutta l'area aeroportuale accessibile al pubblico",
      "La parte di aeroporto posta oltre i varchi doganali e/o le postazioni di controllo di sicurezza",
      "Solo le piste di volo e le vie di rullaggio",
    ],
    correctIndex: 1,
    explanation:
      "L'Airside è la parte di aeroporto oltre i varchi di sicurezza, accessibile solo a personale autorizzato. Perché? Separare l'area operativa dal pubblico è fondamentale per prevenire intrusioni che potrebbero causare incidenti con aeromobili in movimento. 💡 Ricorda: immagina un backstage teatrale — il pubblico vede lo spettacolo (Landside), ma dietro le quinte (Airside) operano solo gli addetti.",
    topic: "Definizioni",
  },
  {
    id: "def-02",
    question: "Cos'è un Apron (piazzale)?",
    options: [
      "Un percorso destinato al rullaggio degli aeromobili",
      "Un'area predefinita per la sosta degli aeromobili, imbarco/sbarco passeggeri, carico/scarico merci, rifornimento e manutenzione",
      "La pista di decollo e atterraggio",
    ],
    correctIndex: 1,
    explanation:
      "Il piazzale (Apron) è l'area destinata a tutte le operazioni di assistenza agli aeromobili: imbarco/sbarco passeggeri, carico merci, rifornimento e manutenzione. Perché? Concentrare tutte le operazioni in un'area definita permette di coordinare in sicurezza mezzi, personale e aeromobili simultaneamente. 💡 Ricorda: l'Apron è come il paddock di una gara — tutto ciò che serve all'auto (aereo) prima di partire.",
    topic: "Definizioni",
  },
  {
    id: "def-03",
    question: "Cos'è l'Area di Manovra (Manoeuvring Area)?",
    options: [
      "La parte di aeroporto adibita al decollo, atterraggio e movimento al suolo degli aeromobili, esclusi i piazzali",
      "L'insieme di piazzali e vie di rullaggio",
      "Solo le piste di volo",
    ],
    correctIndex: 0,
    explanation:
      "L'Area di Manovra comprende piste e vie di rullaggio, ma NON i piazzali. Perché? Piste e taxiway sono le infrastrutture critiche dove gli aeromobili si muovono ad alta velocità: tenerle separate dai piazzali riduce il rischio di interferenze durante decollo e atterraggio. 💡 Ricorda: Area di Manovra = dove gli aerei si «muovono»: piste e taxiway, non i parcheggi (piazzali).",
    topic: "Definizioni",
  },
  {
    id: "def-04",
    question: "Cos'è l'Area di Movimento (Movement Area)?",
    options: [
      "Solo i piazzali aeromobili",
      "La parte di aeroporto comprendente l'Area di Manovra e i piazzali",
      "Le sole piste di volo",
    ],
    correctIndex: 1,
    explanation:
      "L'Area di Movimento = Area di Manovra (piste + taxiway) + Piazzali (Apron). Perché? Il termine «Movimento» include tutto ciò che si muove in Airside: aerei in volo, al suolo e in assistenza. Conoscere questa distinzione evita errori di accesso nelle aree sbagliate. 💡 Ricorda: Movimento è più grande di Manovra — il contenitore è sempre più grande del contenuto.",
    topic: "Definizioni",
  },
  {
    id: "def-05",
    question: "Cosa si intende per Via di Rullaggio (Taxiway)?",
    options: [
      "Una via percorsa esclusivamente dai veicoli di servizio",
      "Un percorso definito destinato al rullaggio degli aeromobili, che collega diverse aree dell'aeroporto",
      "La strada perimetrale dell'aeroporto",
    ],
    correctIndex: 1,
    explanation:
      "La taxiway è il percorso dedicato agli aeromobili per collegarsi tra pista, piazzali e hangar. Perché? Separare i percorsi degli aerei da quelli dei veicoli riduce drasticamente il rischio di collisioni sul piazzale. 💡 Ricorda: la taxiway è l'«autostrada» degli aerei a terra — come noi usiamo le strade, loro usano le taxiway.",
    topic: "Definizioni",
  },
  {
    id: "def-06",
    question: "Cosa indica l'acronimo F.O.D.?",
    options: [
      "Danno da corpo estraneo (Foreign Object Damage/Debris)",
      "L'impianto di smistamento automatico dei bagagli",
      "Un'area di sicurezza riservata agli aeromobili",
    ],
    correctIndex: 0,
    explanation:
      "FOD (Foreign Object Damage/Debris) è qualunque oggetto estraneo che potrebbe danneggiare un aeromobile o i suoi motori. Perché? Un semplice bullone sul piazzale può distruggere un motore a reazione: i danni da FOD costano milioni e mettono a rischio la vita dei passeggeri. 💡 Ricorda: FOD = «roba in giro che non dovrebbe esserci» — raccoglila sempre, anche se non è tua.",
    topic: "Definizioni",
  },
  {
    id: "def-07",
    question: "Cos'è una Piazzola per aeromobile (Aircraft Stand)?",
    options: [
      "Un'area destinata alla manutenzione dell'aeromobile",
      "Una specifica area del piazzale adibita al parcheggio di un aeromobile",
      "L'area che comprende piazzali e raccordi",
    ],
    correctIndex: 1,
    explanation:
      "La piazzola (aircraft stand) è la porzione di piazzale destinata al parcheggio e all'assistenza di un singolo aeromobile. Perché? Ogni piazzola ha aree definite (ERA, ESA, ERL) che regolano dove i mezzi possono operare, garantendo sicurezza durante le operazioni di assistenza. 💡 Ricorda: la piazzola è come il «box» di Formula 1 — uno spazio preciso per ogni aereo con regole rigide su chi può entrare.",
    topic: "Definizioni",
  },
  {
    id: "def-08",
    question: "Cosa si intende per ERA (Equipment Restriction Area)?",
    options: [
      "Area di accesso riservata ai soli passeggeri",
      "Area di accesso limitato per i mezzi di rampa",
      "Area destinata alla manutenzione degli aeromobili",
    ],
    correctIndex: 1,
    explanation:
      "L'ERA (Equipment Restriction Area) è la zona ad accesso limitato per i mezzi di rampa, attorno all'aeromobile. Perché? Limitare l'accesso attorno alle parti delicate dell'aereo (ali, motori, carrello) riduce il rischio di collisioni con gli equipaggiamenti. 💡 Ricorda: ERA = «zona rossa» — ci entri solo se il tuo lavoro lo richiede.",
    topic: "Definizioni",
  },
  {
    id: "def-09",
    question: "Cosa si intende per ESA (Equipment Service Area)?",
    options: [
      "Area di attesa per il servizio dei mezzi di rampa",
      "Area riservata ai veicoli di emergenza",
      "Area destinata al carico/scarico merci",
    ],
    correctIndex: 0,
    explanation:
      "L'ESA (Equipment Service Area) è la zona di attesa per i mezzi di rampa in servizio agli aeromobili. Perché? Avere un'area di attesa ordinata evita ingorghi attorno all'aereo e mantiene libere le vie di accesso per i mezzi urgenti (rifornimento, emergenza). 💡 Ricorda: ESA = «sala d'attesa» dei mezzi — si aspetta il proprio turno prima di avanzare verso l'aereo.",
    topic: "Definizioni",
  },
  {
    id: "def-10",
    question: "L'aeroporto è suddiviso in due grandi macroaree. Quali?",
    options: [
      "Area cargo e area passeggeri",
      "Landside e Airside",
      "Area di manovra e area di movimento",
    ],
    correctIndex: 1,
    explanation:
      "L'aeroporto è diviso in Landside (area pubblica, lato terra) e Airside (area operativa oltre i controlli di sicurezza). Perché? Separare l'area pubblica da quella operativa è un requisito di sicurezza internazionale: impedisce che persone non autorizzate accedano ad aree dove operano aeromobili. 💡 Ricorda: Landside = dove vai col bagaglio prima del check-in; Airside = dove vai dopo il controllo passaporti.",
    topic: "Definizioni",
  },

  // ── ADC – TIPI E REQUISITI ───────────────────────────────────────────────────
  {
    id: "adc-01",
    question: "L'ADC di tipo A (Apron) abilita il conducente alla guida:",
    options: [
      "Solo in Area di Manovra",
      "Sui piazzali aeromobili, sulla viabilità veicolare in Airside e sulla strada perimetrale (soggetti autorizzati)",
      "Solo sulle vie di rullaggio",
    ],
    correctIndex: 1,
    explanation:
      "L'ADC-A abilita alla guida su piazzali, veicolari e strada perimetrale (solo soggetti autorizzati) — NON in Area di Manovra. Perché? L'Area di Manovra (piste e taxiway principali) richiede competenze aggiuntive e coordinamento con la Torre di Controllo: serve l'ADC-M. 💡 Ricorda: ADC-A = Apron — piazzali e strade; per le piste/taxiway principali ci vuole il livello «M» superiore.",
    topic: "ADC",
  },
  {
    id: "adc-02",
    question: "L'ADC di tipo M abilita il conducente alla guida:",
    options: [
      "Solo sui piazzali e veicolari",
      "Anche in Area di Manovra (piste e vie di rullaggio), oltre all'abilitazione ADC-A",
      "Solo sulla strada perimetrale",
    ],
    correctIndex: 1,
    explanation:
      "L'ADC-M include le aree dell'ADC-A e aggiunge l'Area di Manovra (piste e taxiway principali). Perché? Operare in Area di Manovra richiede comunicazione radio UHF con la Torre di Controllo e conoscenza approfondita del traffico aereo: è un ambiente molto più pericoloso dei piazzali. 💡 Ricorda: ADC-M = ADC-A + Manovra — M è il «livello avanzato».",
    topic: "ADC",
  },
  {
    id: "adc-03",
    question: "Qual è la validità dell'ADC-A?",
    options: ["3 anni", "5 anni", "4 anni"],
    correctIndex: 2,
    explanation:
      "L'ADC-A ha una validità di 4 anni. Perché? Una scadenza quadriennale garantisce che i conducenti aggiornino periodicamente le proprie conoscenze sulle norme in evoluzione, in linea con i cicli di revisione previsti dalla regolamentazione EU 139/2014. 💡 Ricorda: 4 anni come il rinnovo di molte patenti specializzate — «quattro ruote, quattro anni».",
    topic: "ADC",
  },
  {
    id: "adc-04",
    question:
      "Con quale frequenza è obbligatorio il recurrent training per mantenere la validità dell'ADC-A?",
    options: ["Ogni 12 mesi", "Ogni 24 mesi", "Ogni 48 mesi"],
    correctIndex: 1,
    explanation:
      "Il recurrent training deve essere effettuato ogni 24 mesi per mantenere valida l'ADC-A. Perché? Le procedure aeroportuali cambiano frequentemente; un aggiornamento biennale assicura che i conducenti siano sempre allineati alle ultime norme operative e di sicurezza. 💡 Ricorda: ogni 2 anni = ogni volta che si tengono le Olimpiadi estive.",
    topic: "ADC",
  },
  {
    id: "adc-05",
    question:
      "Per il rilascio dell'ADC-A è necessario il possesso di quale permesso di accesso aeroportuale?",
    options: [
      "Solo per ADC di tipo M",
      "In nessun caso",
      "Sempre: TIA (Tesserino Ingresso Aeroportuale) con banda verde o rossa",
    ],
    correctIndex: 2,
    explanation:
      "Per ottenere l'ADC-A è sempre necessario il TIA con banda verde o rossa (o azzurro 4 per il cargo di FCO). Perché? Il TIA attesta che il soggetto ha superato i controlli di sicurezza necessari per l'accesso in Airside: senza di esso, l'abilitazione alla guida non ha senso. 💡 Ricorda: prima il pass (TIA), poi la patente (ADC) — l'ADC senza TIA è come avere la chiave senza la porta.",
    topic: "ADC",
  },
  {
    id: "adc-06",
    question:
      "L'esame teorico per l'ADC-A è composto da quante domande e qual è la soglia minima per superarlo?",
    options: [
      "30 domande, minimo 25 corrette",
      "20 domande, minimo 18 corrette entro 25 minuti",
      "25 domande, minimo 20 corrette",
    ],
    correctIndex: 1,
    explanation:
      "L'esame ADC-A prevede 20 domande a risposta multipla: ne bastano 18 corrette in 25 minuti per superarlo. Perché? Una soglia del 90% riflette la serietà dell'ambiente aeroportuale: margini di errore bassi riducono il rischio di conducenti impreparati in un contesto ad alto rischio. 💡 Ricorda: 20 domande, 18 giuste = puoi sbagliare solo 2 — quasi la perfezione.",
    topic: "ADC",
  },
  {
    id: "adc-07",
    question:
      "Quanto tempo ha il candidato per ritirare l'ADC dopo il superamento dell'esame teorico?",
    options: ["15 giorni", "60 giorni", "30 giorni"],
    correctIndex: 2,
    explanation:
      "Dopo il superamento dell'esame, l'ADC deve essere ritirata entro 30 giorni. Perché? Garantisce che l'abilitazione sia consegnata a chi ha superato l'esame di recente e mantiene aggiornato il registro degli abilitati. 💡 Ricorda: 30 giorni = 1 mese — non rimandare, o ricomincerai da capo.",
    topic: "ADC",
  },
  {
    id: "adc-08",
    question:
      "In caso di mancato superamento dell'esame teorico, dopo quanto tempo si può ripetere?",
    options: [
      "Almeno due settimane",
      "Almeno un mese",
      "Immediatamente, nello stesso giorno",
    ],
    correctIndex: 0,
    explanation:
      "In caso di insuccesso all'esame, si deve aspettare almeno 2 settimane prima di riprovare. Perché? Questo tempo serve per ripassare il materiale; un secondo insuccesso obbliga a ripetere l'intero iter, quindi meglio prepararsi bene. 💡 Ricorda: «aspetta 2 settimane per non dover aspettare mesi» — un po' di studio extra evita il restart completo.",
    topic: "ADC",
  },
  {
    id: "adc-09",
    question:
      "Qual è la durata minima dell'addestramento pratico iniziale a Fiumicino e a Ciampino?",
    options: [
      "4 ore a Ciampino e 2 ore a Fiumicino",
      "4 ore a Fiumicino e 2 ore a Ciampino",
      "4 ore in entrambi gli aeroporti",
    ],
    correctIndex: 1,
    explanation:
      "L'addestramento pratico iniziale deve durare almeno 4 ore a FCO e 2 ore a CIA. Perché? Fiumicino è molto più grande e complesso di Ciampino: richiede più ore per prendere familiarità con il layout e il traffico. 💡 Ricorda: FCO grande = 4 ore; CIA piccola = 2 ore — proporzionale alla dimensione.",
    topic: "ADC",
  },
  {
    id: "adc-10",
    question:
      "Chi può supervisionare l'addestramento pratico per l'ADC-A?",
    options: [
      "Un funzionario della sicurezza aeroportuale qualsiasi",
      "Un istruttore certificato dal Ministero dei Trasporti",
      "Un soggetto con qualifica di A.D.E. (Airside Driving Expert) tipo A del Gruppo ADR o qualificato da ADR",
    ],
    correctIndex: 2,
    explanation:
      "L'addestramento pratico deve essere supervisionato da un ADE tipo A del Gruppo ADR o qualificato da ADR. Perché? Solo un esperto certificato può garantire che il candidato acquisisca le competenze operative necessarie in un ambiente reale ad alto rischio. 💡 Ricorda: ADE = Airside Driving Expert — il tuo «istruttore di guida» ma per l'Airside.",
    topic: "ADC",
  },
  {
    id: "adc-11",
    question:
      "Se si interrompe la guida in Apron per un periodo continuativo tra 3 e 12 mesi, cosa è previsto?",
    options: [
      "Un'autodichiarazione al datore di lavoro",
      "Un refresher training pratico (2 ore a FCO, 1 ora a CIA) supervisionato da un ADE",
      "Il candidato deve ripetere l'intero iter di conseguimento dell'ADC",
    ],
    correctIndex: 1,
    explanation:
      "Per interruzioni tra 3 e 12 mesi è previsto un refresher training pratico (2 ore FCO, 1 ora CIA). Perché? Anche poche settimane di inattività possono far dimenticare abitudini critiche di sicurezza; il refresher riduce il rischio senza dover ripetere tutto da zero. 💡 Ricorda: pausa media = ripasso breve; pausa lunga (>12 mesi) = ricomincia daccapo.",
    topic: "ADC",
  },
  {
    id: "adc-12",
    question:
      "Se si interrompe la guida in Apron per un periodo superiore a 12 mesi, cosa accade all'ADC-A?",
    options: [
      "È sufficiente un refresher training",
      "L'ADC-A rimane valida ma si deve fare un aggiornamento teorico",
      "La validità dell'ADC-A decade e si deve ripetere il normale iter per una nuova abilitazione",
    ],
    correctIndex: 2,
    explanation:
      "Interruzione superiore a 12 mesi = decadenza dell'ADC-A, con obbligo di ripetere l'intero iter. Perché? Dopo un anno di inattività, le conoscenze possono essere troppo obsolete e le abitudini di sicurezza troppo degradate: si riparte da zero per sicurezza. 💡 Ricorda: 12 mesi = 1 anno = reset completo — mantieniti in pratica!",
    topic: "ADC",
  },
  {
    id: "adc-13",
    question:
      "L'ADC è un documento personale? Può essere ceduto ad altri conducenti?",
    options: [
      "No, può essere ceduto temporaneamente a colleghi dello stesso ente",
      "Sì, è personale e non cedibile",
      "Può essere ceduto solo previo nulla osta del datore di lavoro",
    ],
    correctIndex: 1,
    explanation:
      "L'ADC è personale e non cedibile a nessun altro conducente. Perché? L'ADC certifica le competenze di una specifica persona verificata da ADR: cederla significa bypassare tutti i controlli di sicurezza e di identità. 💡 Ricorda: l'ADC è come la firma — non puoi firmare al posto di un altro.",
    topic: "ADC",
  },
  {
    id: "adc-14",
    question:
      "Per ottenere l'ADC-A è necessario prima aver conseguito quale altro attestato?",
    options: [
      "Il corso di radiotelefonia",
      "Il corso Airside Safety (Safety Modulo 2), in corso di validità (non superiore a 24 mesi)",
      "Il corso antincendio",
    ],
    correctIndex: 1,
    explanation:
      "Prima di conseguire l'ADC, è necessario avere l'attestato del corso Airside Safety Modulo 2 in corso di validità (max 24 mesi). Perché? La sicurezza in Airside richiede prima una formazione generale sulle procedure di sicurezza aeroportuale, poi quella specifica per la guida. 💡 Ricorda: prima «sai stare in Airside», poi «guidi in Airside» — l'ordine non si può invertire.",
    topic: "ADC",
  },
  {
    id: "adc-15",
    question:
      "Per estendere un'ADC-A già posseduta (per uno scalo) all'altro aeroporto (FCO o CIA), cosa è necessario fare?",
    options: [
      "Ripetere l'intero iter teorico e pratico come per il primo rilascio",
      "Solo effettuare l'addestramento pratico nello scalo di richiesta e presentare la documentazione",
      "È sufficiente presentare domanda scritta al Tesseramento ADR",
    ],
    correctIndex: 1,
    explanation:
      "Per estendere l'ADC-A a un secondo scalo è sufficiente effettuare solo l'addestramento pratico nel nuovo scalo. Perché? La teoria è già stata appresa; quello che cambia è la specifica configurazione del nuovo aeroporto, che si acquisisce con la pratica. 💡 Ricorda: l'esame teorico non si ripete — basta imparare le strade del nuovo aeroporto in pratica.",
    topic: "ADC",
  },

  // ── SISTEMA SANZIONATORIO ────────────────────────────────────────────────────
  {
    id: "san-01",
    question: "Quanti punti ha in dotazione ogni ADC (sistema sanzionatorio FCO/CIA)?",
    options: ["3 punti", "5 punti", "10 punti"],
    correctIndex: 1,
    explanation:
      "Ogni ADC dispone di 5 punti che possono essere decurtati in base alle infrazioni commesse. Perché? Il sistema a punti responsabilizza i conducenti: sanzioni progressive creano un incentivo concreto al rispetto delle regole in un ambiente dove un errore può costare vite umane. 💡 Ricorda: come la patente civile italiana — 5 punti, si parte dal basso.",
    topic: "Sanzioni",
  },
  {
    id: "san-02",
    question: "Quanti punti vengono decurtati per violazione dell'obbligo di dare precedenza agli aeromobili (anche se trainati)?",
    options: ["1 punto", "4 punti", "5 punti"],
    correctIndex: 1,
    explanation:
      "Mancata precedenza agli aeromobili (anche se trainati) = 4 punti decurtati. Perché? Gli aeromobili non possono frenare bruscamente né cambiare direzione istantaneamente: se un veicolo non cede, l'aereo non può evitarlo e il danno è enorme. 💡 Ricorda: 4 punti = la sanzione più grave dopo la revoca immediata — gli aerei non possono scansarsi.",
    topic: "Sanzioni",
  },
  {
    id: "san-03",
    question: "Quanti punti vengono decurtati per mancata esposizione del tesserino (TIA)?",
    options: ["1 punto", "2 punti", "3 punti"],
    correctIndex: 0,
    explanation:
      "Mancata esposizione del TIA = 1 punto decurtato. Perché? Il tesserino visibile permette a chiunque di identificare rapidamente chi ha accesso autorizzato: senza di esso, non è possibile rilevare intrusi o persone che operano oltre i limiti della propria autorizzazione. 💡 Ricorda: 1 punto solo, ma il TIA va esposto sempre — è la tua «carta d'identità» in Airside.",
    topic: "Sanzioni",
  },
  {
    id: "san-04",
    question: "Quanti punti vengono decurtati per aver fumato durante la guida di un veicolo in Airside?",
    options: [
      "3 punti",
      "1 punto",
      "Revoca immediata dell'abilitazione",
    ],
    correctIndex: 0,
    explanation:
      "Fumare durante la guida in Airside = 3 punti decurtati. Perché? Fumare vicino ad aree di rifornimento o mentre si maneggiano materiali infiammabili è un pericolo di incendio gravissimo; anche la distrazione causata dalla sigaretta può essere fatale. 💡 Ricorda: 3 punti per la sigaretta — quasi quanto non dare precedenza a un aereo.",
    topic: "Sanzioni",
  },
  {
    id: "san-05",
    question: "Quanti punti vengono decurtati per mancato rispetto della segnaletica stradale (orizzontale o verticale) in Airside?",
    options: ["1 punto", "2 punti", "4 punti"],
    correctIndex: 0,
    explanation:
      "Mancato rispetto della segnaletica stradale = 1 punto decurtato. Perché? La segnaletica in Airside non è decorativa: ogni cartello ha un significato operativo preciso legato alla sicurezza degli aeromobili. Ignorarla può portare a incidenti anche gravi. 💡 Ricorda: 1 punto, ma non è «solo» segnaletica — in Airside ogni segno conta.",
    topic: "Sanzioni",
  },
  {
    id: "san-06",
    question: "Quando l'ADC viene revocata per esaurimento punti, quando può essere nuovamente conseguita?",
    options: [
      "Immediatamente, con le stesse modalità del primo rilascio",
      "Con le stesse modalità del primo rilascio; il corso teorico obbligatoriamente presso il Training Center ADR",
      "Solo dopo 365 giorni",
    ],
    correctIndex: 1,
    explanation:
      "ADC revocata per esaurimento punti: si può riconquistare con il normale iter, ma il corso teorico è obbligatoriamente presso il Training Center ADR. Perché? Chi ha esaurito i punti ha dimostrato lacune comportamentali: il corso obbligatorio in presenza garantisce un apprendimento supervisionato più efficace. 💡 Ricorda: esauriti i punti → si riparte, ma il teorico solo dal vivo ad ADR — niente e-learning questa volta.",
    topic: "Sanzioni",
  },
  {
    id: "san-07",
    question: "In caso di guida senza aver mai conseguito l'ADC, dopo quanto tempo è possibile conseguirla?",
    options: [
      "60 giorni dalla data di accertamento della violazione",
      "120 giorni dalla data di accertamento della violazione",
      "365 giorni dalla data di accertamento della violazione",
    ],
    correctIndex: 2,
    explanation:
      "Guida senza aver mai conseguito l'ADC = impossibilità di conseguirla per 365 giorni. Perché? Guidare senza abilitazione in Airside è la violazione più grave: la sanzione severa scoraggia chi potrebbe tentare di operare «in nero» mettendo a rischio tutti. 💡 Ricorda: un anno di attesa — è un reato grave, non una svista.",
    topic: "Sanzioni",
  },
  {
    id: "san-08",
    question:
      "Chi è preposto alla vigilanza e controllo del rispetto delle norme di circolazione veicolare in aeroporto?",
    options: [
      "Solo il personale ADR",
      "Polizia di Stato, Carabinieri, Guardia di Finanza, Sicurezza Operativa ADR e personale Safety & Compliance Monitoring ADR",
      "Solo ENAC",
    ],
    correctIndex: 1,
    explanation:
      "La vigilanza è affidata a: Polizia di Stato, Carabinieri, GdF, Sicurezza Operativa ADR e Safety & Compliance Monitoring ADR. Perché? Un sistema di vigilanza multi-ente garantisce copertura completa e indipendenza nei controlli: nessun operatore può «farsi gli affari propri» senza essere notato. 💡 Ricorda: tante forze, un solo obiettivo — sicurezza in Airside.",
    topic: "Sanzioni",
  },

  // ── OBBLIGHI DEL CONDUCENTE ──────────────────────────────────────────────────
  {
    id: "obl-01",
    question: "In Airside è consentita la circolazione con ciclomotori, motocicli e biciclette?",
    options: [
      "Sì, ma solo durante l'orario diurno",
      "No, è vietata",
      "Sì, purché il conducente abbia l'ADC-A",
    ],
    correctIndex: 1,
    explanation:
      "In Airside è vietata la circolazione con ciclomotori, motocicli e biciclette. Perché? Questi mezzi non offrono la stabilità e il controllo necessari in un ambiente con traffico pesante, vento da jet blast e superfici sdrucciolevoli; il rischio di caduta e investimento è troppo alto. 💡 Ricorda: in Airside solo mezzi a 4 ruote (o più) — niente due ruote.",
    topic: "Obblighi conducente",
  },
  {
    id: "obl-02",
    question: "L'uso delle cinture di sicurezza in Airside è:",
    options: [
      "Obbligatorio sempre, qualora il mezzo ne sia dotato",
      "Obbligatorio solo sulle veicolari",
      "Facoltativo a passo d'uomo",
    ],
    correctIndex: 0,
    explanation:
      "Le cinture di sicurezza sono obbligatorie sempre, se il mezzo ne è dotato. Perché? Anche a bassa velocità, una frenata brusca per evitare un aeromobile può proiettare violentemente il conducente; la cintura è la prima protezione in caso di emergenza. 💡 Ricorda: 30 km/h senza cintura in una frenata brusca equivale a cadere dal primo piano.",
    topic: "Obblighi conducente",
  },
  {
    id: "obl-03",
    question: "È consentito usare il cellulare alla guida in Airside?",
    options: [
      "Sì, sempre in caso di emergenza operativa",
      "Solo con sincronizzazione Bluetooth attiva o auricolari (con o senza filo); scrittura e video sono sempre vietati",
      "Sì, se autorizzati dal responsabile di turno",
    ],
    correctIndex: 1,
    explanation:
      "Il cellulare è vietato alla guida, tranne in vivavoce/Bluetooth o auricolari. La scrittura su qualsiasi dispositivo e l'ascolto di musica/video sono sempre vietati. Perché? La distrazione è la causa principale degli incidenti in Airside: pochi secondi di disattenzione possono portare sotto un aeromobile. 💡 Ricorda: «due occhi sulla strada, zero sullo schermo» — in Airside c'è sempre qualcosa in movimento.",
    topic: "Obblighi conducente",
  },
  {
    id: "obl-04",
    question: "Chi è responsabile della verifica dell'efficienza del mezzo prima di usarlo in Airside?",
    options: [
      "Il responsabile dell'officina di manutenzione",
      "Il datore di lavoro",
      "Il conducente che lo utilizzerà",
    ],
    correctIndex: 2,
    explanation:
      "Il conducente è responsabile di verificare l'efficienza del mezzo prima dell'uso. Perché? Un mezzo con freni difettosi o pneumatici sgonfi non può fermarsi in tempo davanti a un aeromobile: il controllo pre-turno è l'ultima barriera prima di un possibile incidente. 💡 Ricorda: sei tu il pilota del mezzo — nessun altro può sapere meglio di te se è pronto.",
    topic: "Obblighi conducente",
  },
  {
    id: "obl-05",
    question: "Durante la verifica del mezzo, quali apparati il conducente è tenuto a controllare prioritariamente?",
    options: [
      "Cambio e frizione",
      "Sportelli e volante",
      "Freni e pneumatici",
    ],
    correctIndex: 2,
    explanation:
      "Il conducente deve controllare prioritariamente freni e pneumatici prima dell'uso. Perché? Freni e pneumatici sono i sistemi di arresto del mezzo: senza di essi funzionanti, non è possibile rispettare le distanze di sicurezza né fermarsi davanti agli aeromobili. 💡 Ricorda: freni = stop davanti all'aereo; pneumatici = grip sulla pavimentazione bagnata.",
    topic: "Obblighi conducente",
  },
  {
    id: "obl-06",
    question: "È consentita la circolazione con le portiere aperte in Airside?",
    options: [
      "Sì, ma solo a velocità inferiore a 10 km/h",
      "No, è vietato",
      "Sì, solo se il mezzo non supera i 5 km/h",
    ],
    correctIndex: 1,
    explanation:
      "È vietato circolare con le portiere aperte in Airside. Perché? Una portiera aperta aumenta l'ingombro laterale del mezzo e può colpire personale a piedi, attrezzature, o parti dell'aeromobile durante le manovre nelle piazzole. 💡 Ricorda: portiere chiuse = profilo più stretto = più sicuro in spazi stretti tra aeromobili.",
    topic: "Obblighi conducente",
  },
  {
    id: "obl-07",
    question: "La circolazione in Airside è autorizzata per:",
    options: [
      "Qualsiasi motivo, purché si abbia l'ADC",
      "I soli fini di servizio/operativi",
      "Motivi di servizio e spostamenti personali del personale aeroportuale",
    ],
    correctIndex: 1,
    explanation:
      "La circolazione in Airside è autorizzata esclusivamente per fini di servizio/operativi. Perché? L'Airside è un'area produttiva ad alto rischio: il traffico non operativo aumenta il numero di veicoli e quindi la probabilità di incidenti senza alcun beneficio operativo. 💡 Ricorda: non è un parcheggio né una scorciatoia — ogni veicolo in Airside deve avere uno scopo preciso.",
    topic: "Obblighi conducente",
  },
  {
    id: "obl-08",
    question: "Chi è obbligato ad accertarsi che il carico trasportato sia solidamente sistemato?",
    options: [
      "Il rampista",
      "Il capo scalo della compagnia aerea",
      "Il conducente del mezzo",
    ],
    correctIndex: 2,
    explanation:
      "Il conducente è responsabile che il carico sia solidamente sistemato prima di partire. Perché? Un carico mal fissato può cadere sulla pista o in piazzola diventando un FOD pericoloso per gli aeromobili o un ostacolo per altri mezzi. 💡 Ricorda: il FOD che hai creato tu può distruggere un motore da milioni di euro — assicura sempre il carico.",
    topic: "Obblighi conducente",
  },
  {
    id: "obl-09",
    question: "In caso di sosta sottobordo (vicino all'aeromobile), cosa è obbligatorio fare?",
    options: [
      "Lasciare il motore al minimo",
      "Spegnere il motore e inserire il freno di parcheggio",
      "Chiudere le portiere a chiave",
    ],
    correctIndex: 1,
    explanation:
      "In sosta sottobordo è obbligatorio spegnere il motore e inserire il freno di parcheggio. Perché? I gas di scarico vicino all'aeromobile sono un rischio incendio; il freno di parcheggio evita movimenti non intenzionali che potrebbero causare collisioni con la struttura dell'aereo. 💡 Ricorda: motore spento + freno inserito = il mezzo non si muove e non produce gas pericolosi.",
    topic: "Obblighi conducente",
  },
  {
    id: "obl-10",
    question: "Il conducente dell'ADC deve portare con sé l'abilitazione durante la guida in Airside?",
    options: [
      "No, basta averla in ufficio",
      "Solo se richiesto espressamente dalla Sicurezza Operativa ADR",
      "Sì, deve sempre portarla con sé insieme alla patente di guida civile ed esibirla agli organi competenti",
    ],
    correctIndex: 2,
    explanation:
      "Il titolare ADC deve sempre portarla con sé insieme alla patente di guida civile e esibirla a richiesta. Perché? I controlli in Airside devono essere rapidi: avere i documenti subito disponibili consente alle autorità di verificare l'autorizzazione in pochi secondi, senza rallentare le operazioni. 💡 Ricorda: ADC + patente civile, sempre in tasca — entrambi, non uno solo.",
    topic: "Obblighi conducente",
  },

  // ── LIMITI DI VELOCITÀ ────────────────────────────────────────────────────────
  {
    id: "vel-01",
    question: "Qual è il limite di velocità sulle veicolari e sulla strada perimetrale in Airside?",
    options: ["20 km/h", "30 km/h", "40 km/h"],
    correctIndex: 1,
    explanation:
      "Il limite di velocità sulle veicolari e sulla strada perimetrale è 30 km/h. Perché? Gli aeromobili si muovono silenziosamente a terra e possono emergere da dietro hangar o angoli ciechi senza preavviso: a 30 km/h un veicolo riesce a fermarsi in tempo. 💡 Ricorda: 30 km/h in Airside = come un centro storico a traffico limitato — slow and safe.",
    topic: "Velocità",
  },
  {
    id: "vel-02",
    question: "Qual è il limite di velocità nell'area di smistamento bagagli?",
    options: ["5 km/h", "10 km/h", "15 km/h"],
    correctIndex: 1,
    explanation:
      "Il limite di velocità nell'area smistamento bagagli è 10 km/h. Perché? Quest'area è ad alta densità di personale a piedi che lavora con le teste basse sui nastri: una velocità ridotta dà il tempo di frenare davanti a una persona che sbuca improvvisamente. 💡 Ricorda: 10 km/h = passo veloce di una persona che corre — si può fermare in tempo.",
    topic: "Velocità",
  },
  {
    id: "vel-03",
    question: "Qual è la velocità raccomandata all'interno delle piazzole aeromobili?",
    options: ["10 km/h", "A passo d'uomo", "5 km/h"],
    correctIndex: 1,
    explanation:
      "All'interno delle piazzole la velocità raccomandata è a passo d'uomo (circa 4-5 km/h). Perché? In piazzola ci sono persone a piedi che lavorano attorno all'aereo, attrezzature posizionate ovunque e spazio molto limitato: la velocità minima garantisce reattività massima. 💡 Ricorda: passo d'uomo = letteralmente camminare — quasi sempre più sicuro procedere a piedi che guidare veloce.",
    topic: "Velocità",
  },
  {
    id: "vel-04",
    question: "Cosa può determinare un ulteriore abbassamento del limite di velocità di 30 km/h in Airside?",
    options: [
      "Il tipo di veicolo che si conduce",
      "Le condizioni del mezzo che si conduce",
      "Le condizioni di traffico e meteorologiche",
    ],
    correctIndex: 2,
    explanation:
      "Il limite di 30 km/h può essere ulteriormente abbassato in condizioni di traffico intenso o avverse. Perché? Le condizioni dell'ambiente (pioggia, nebbia, vento forte, traffico elevato) riducono le distanze di reazione e la visibilità: la velocità deve adattarsi alla situazione reale. 💡 Ricorda: 30 è il limite massimo, non l'obiettivo — se vedi poco o c'è traffico, vai più piano.",
    topic: "Velocità",
  },
  {
    id: "vel-05",
    question: "In prossimità dei cantieri, qual è il limite di velocità?",
    options: ["5 km/h", "20 km/h", "30 km/h"],
    correctIndex: 1,
    explanation:
      "In prossimità dei cantieri il limite è 20 km/h. Perché? I cantieri in Airside hanno personale a piedi, attrezzature sporgenti e percorsi modificati: ridurre la velocità dà il tempo di reagire a situazioni inaspettate. 💡 Ricorda: cantiere = imprevedibile — 20 km/h lascia margine di reazione.",
    topic: "Velocità",
  },

  // ── PRECEDENZE ───────────────────────────────────────────────────────────────
  {
    id: "pre-01",
    question: "Un aeromobile ha la precedenza:",
    options: [
      "Solo quando è in rullaggio autonomo",
      "Su tutti gli altri veicoli e mezzi, compresi quelli di emergenza",
      "Su tutti gli altri veicoli e mezzi, esclusi i veicoli di soccorso in emergenza con luce blu e sirena",
    ],
    correctIndex: 2,
    explanation:
      "L'aeromobile (anche se trainato) ha la precedenza su tutti i veicoli, tranne i mezzi di soccorso in emergenza con luce blu rotante e sirena. Perché? Un aeromobile non può frenare bruscamente né cambiare direzione istantaneamente: se un veicolo non cede, l'aereo non può evitarlo e il danno è enorme. 💡 Ricorda: la gerarchia in Airside è Emergenza (blu+sirena) > Aereo > Tutto il resto.",
    topic: "Precedenze",
  },
  {
    id: "pre-02",
    question: "I mezzi operativi di soccorso in emergenza (luce blu + sirena) hanno la precedenza:",
    options: [
      "Su tutti gli altri veicoli, compresi gli aeromobili in rullaggio",
      "Su tutti gli altri veicoli ma non sugli aeromobili",
      "Solo sulle veicolari, non sui piazzali",
    ],
    correctIndex: 0,
    explanation:
      "I mezzi di soccorso con luce blu e sirena hanno precedenza assoluta su tutti, compresi gli aeromobili in rullaggio. Perché? In un'emergenza ogni secondo conta: nessun altro obiettivo — nemmeno un aereo in movimento — può giustificare un ritardo dei soccorsi. 💡 Ricorda: blu+sirena = via libera totale, SEMPRE — anche davanti a un Boeing.",
    topic: "Precedenze",
  },
  {
    id: "pre-03",
    question: "I veicoli della Sicurezza Operativa ADR con luce gialla rotante attivata hanno la precedenza:",
    options: [
      "Sugli aeromobili in rullaggio",
      "Su tutti gli altri veicoli ma non su quelli con luce blu rotante attivata",
      "Su tutti i veicoli compresi quelli con luce blu rotante",
    ],
    correctIndex: 1,
    explanation:
      "La luce gialla rotante conferisce precedenza su tutti i veicoli eccetto quelli con luce blu rotante (emergenza). Perché? La luce gialla identifica veicoli ADR o ENAC in missione operativa critica (ispezioni, controlli): hanno priorità per svolgere il loro ruolo di supervisione della sicurezza. 💡 Ricorda: giallo > tutti gli altri veicoli, ma non batte il blu — giallo è secondo nella gerarchia.",
    topic: "Precedenze",
  },
  {
    id: "pre-04",
    question: "L'autocisterna per il rifornimento di carburante ha la precedenza:",
    options: [
      "Su tutti i mezzi inclusi quelli di emergenza",
      "Su tutti i mezzi aeroportuali, ad eccezione dei veicoli di emergenza (luce blu)",
      "Non ha alcuna precedenza speciale",
    ],
    correctIndex: 1,
    explanation:
      "L'autocisterna carburante ha precedenza su tutti tranne i veicoli di emergenza (luce blu). Perché? Il rifornimento ha tempi stretti legati alla partenza degli aeromobili; ritardi si ripercuotono su tutta la catena operativa. 💡 Ricorda: cisterna > mezzi normali, ma blu batte tutto — il carburante è importante, l'emergenza è urgente.",
    topic: "Precedenze",
  },
  {
    id: "pre-05",
    question: "I trattori che trainano gli aeromobili hanno la precedenza:",
    options: [
      "Sempre, anche se non stanno trainando un aeromobile",
      "Solo quando stanno trainando un aeromobile",
      "Non sui veicoli con luce rotante attiva",
    ],
    correctIndex: 1,
    explanation:
      "I trattori hanno la precedenza solo quando stanno effettivamente trainando un aeromobile. Perché? Quando trainano un aereo, la manovra è delicata e i tempi di frenata sono lunghissimi: nessuno può permettersi di tagliare la strada. Quando il trattore è libero, è un veicolo normale. 💡 Ricorda: trattore con aereo agganciato = aereo stesso — cede tutti; trattore vuoto = nessuna precedenza speciale.",
    topic: "Precedenze",
  },
  {
    id: "pre-06",
    question: "Il bus interpista pieno di passeggeri ha la precedenza:",
    options: [
      "Non ha precedenze speciali rispetto agli altri mezzi",
      "Su tutti gli altri mezzi quando è pieno di passeggeri",
      "Solo sulle veicolari, non sui piazzali",
    ],
    correctIndex: 1,
    explanation:
      "Il bus interpista ha la precedenza sugli altri mezzi quando trasporta passeggeri. Perché? I passeggeri devono raggiungere l'aereo entro i tempi del gate; ritardi del bus si traducono in ritardi volo e compromettono la sicurezza se i passeggeri sono esposti all'aperto più del necessario. 💡 Ricorda: bus pieno di passeggeri = VIP on board — cedi la strada.",
    topic: "Precedenze",
  },
  {
    id: "pre-07",
    question:
      "Il veicolo ENAC con luce gialla rotante attivata ha la precedenza:",
    options: [
      "Sugli aeromobili in rullaggio",
      "Su tutti gli altri veicoli ma non su quelli con luce blu rotante",
      "Su tutti i veicoli senza eccezioni",
    ],
    correctIndex: 1,
    explanation:
      "Il veicolo ENAC con luce gialla rotante ha precedenza su tutti i veicoli eccetto quelli con luce blu (emergenza). Perché? ENAC svolge funzioni di vigilanza e controllo operative: i suoi veicoli devono muoversi liberamente per garantire la supervisione della sicurezza aeroportuale. 💡 Ricorda: ENAC = autorità di controllo — va e viene quando vuole, tranne davanti ai soccorsi.",
    topic: "Precedenze",
  },

  // ── LUCI E VISIBILITÀ ────────────────────────────────────────────────────────
  {
    id: "luc-01",
    question: "Quando è obbligatorio circolare con le luci anabbaglianti accese?",
    options: [
      "Solo in condizioni di scarsa visibilità",
      "Solo durante le ore notturne",
      "Durante le ore notturne e, di giorno, in condizioni di scarsa visibilità",
    ],
    correctIndex: 2,
    explanation:
      "Le luci anabbaglianti sono obbligatorie di notte e di giorno in condizioni di scarsa visibilità. Perché? In Airside la visibilità del veicolo è critica: un aereo in rullaggio o un marshaller devono vederti immediatamente per evitare collisioni. 💡 Ricorda: anabbaglianti = «sono qui, vedimi» — di notte sempre, di giorno con nebbia/pioggia.",
    topic: "Luci",
  },
  {
    id: "luc-02",
    question: "È possibile utilizzare le luci abbaglianti in Airside?",
    options: [
      "Sì, nelle ore notturne",
      "Sì, in condizioni di scarsa visibilità",
      "In nessun caso",
    ],
    correctIndex: 2,
    explanation:
      "L'uso delle luci abbaglianti è vietato in qualsiasi circostanza in Airside. Perché? Gli abbaglianti possono accecare temporaneamente piloti, marshaller o altri conducenti, causando disorientamento in un ambiente dove ogni secondo conta. 💡 Ricorda: abbaglianti = mai in Airside — non vuoi accecare un pilota che sta rullando.",
    topic: "Luci",
  },
  {
    id: "luc-03",
    question: "In condizioni meteorologiche avverse cosa si deve fare?",
    options: [
      "Accendere i fari abbaglianti per essere più visibili",
      "Accendere i fari anabbaglianti, ridurre la velocità e aumentare le distanze di sicurezza",
      "Lampeggiare con gli abbaglianti",
    ],
    correctIndex: 1,
    explanation:
      "In condizioni avverse: anabbaglianti accesi, velocità ridotta, distanze di sicurezza aumentate. Perché? Pioggia, nebbia e vento riducono visibilità e aderenza: la combinazione di questi accorgimenti mantiene le stesse distanze di reazione effettive che si avrebbero in condizioni normali. 💡 Ricorda: «ADA»: Anabbaglianti, meno velocità (Diminuisci), più distanza (Aumenta) — tre azioni, una sigla.",
    topic: "Luci",
  },

  // ── SEGNALETICA ──────────────────────────────────────────────────────────────
  {
    id: "seg-01",
    question: "Da quale segnaletica orizzontale è identificato il centro (centerline) delle vie di rullaggio (taxiway)?",
    options: [
      "Una linea tratteggiata di colore bianco",
      "Una linea continua di colore giallo",
      "Una doppia linea rossa continua",
    ],
    correctIndex: 1,
    explanation:
      "Il centerline della taxiway è identificato da una linea continua gialla. Perché? Il giallo è il colore universalmente riservato alle infrastrutture degli aeromobili in aeroporto: vedere giallo significa «attenzione, percorso aereo». 💡 Ricorda: giallo = aeromobili; bianco = veicoli — mai confonderli.",
    topic: "Segnaletica",
  },
  {
    id: "seg-02",
    question: "Cosa indica la segnaletica orizzontale di «stop aeronautico» sulle veicolari?",
    options: [
      "Che si è in prossimità di un'area di manutenzione aeromobili",
      "Che bisogna fermarsi a causa del possibile incrocio con aeromobili (taxiway)",
      "Che si sta per entrare nell'area di manovra",
    ],
    correctIndex: 1,
    explanation:
      "Lo stop aeronautico indica l'intersezione tra la viabilità veicolare e una taxiway: fermarsi e verificare l'assenza di aeromobili prima di attraversare. Perché? Un aeromobile che rulla può arrivare silenziosamente e a velocità: senza fermarsi, non hai il tempo di valutare il pericolo correttamente. 💡 Ricorda: stop aeronautico = «guarda a destra, guarda a sinistra, poi attraversa» — come attraversare un binario ferroviario.",
    topic: "Segnaletica",
  },
  {
    id: "seg-03",
    question: "La viabilità veicolare è delimitata da:",
    options: [
      "Una doppia linea continua di colore giallo",
      "Una linea continua di colore rosso",
      "Una linea bianca continua o tratteggiata (che diventa a scacchi bianco/nero all'intersezione con aree taxiway)",
    ],
    correctIndex: 2,
    explanation:
      "La viabilità veicolare è delimitata da linea bianca (continua o tratteggiata); all'intersezione con aree taxiway diventa a scacchi bianco/nero. Perché? Il pattern a scacchi è un avviso visivo chiaro: stai uscendo dalla zona sicura veicolare e stai per attraversare un'area dove transitano aeromobili. 💡 Ricorda: bianco liscio = strada normale; scacchi = attenzione, incrocio con gli aerei.",
    topic: "Segnaletica",
  },
  {
    id: "seg-04",
    question: "Cosa indica una zebratura rossa sulla pavimentazione?",
    options: [
      "Un'area dove possono essere depositati i rifiuti di bordo",
      "Un'area interdetta alla sosta e al transito di qualsiasi mezzo",
      "Un'area per la sosta dei soli mezzi di rampa",
    ],
    correctIndex: 1,
    explanation:
      "La zebratura rossa indica area assolutamente vietata alla sosta e al transito di qualsiasi mezzo. Perché? Le zebrature rosse marcano zone critiche per la sicurezza operativa: potrebbero essere aree di jet blast, zone di sicurezza motori, o corridoi riservati a procedure di emergenza. 💡 Ricorda: rosso = stop totale — non ci passi, non ci parcheggi, non ci metti nulla.",
    topic: "Segnaletica",
  },
  {
    id: "seg-05",
    question: "Cosa indica la segnaletica di NPA (No Parking Area)?",
    options: [
      "Un'area dove è consentita la sosta temporanea",
      "Un'area totalmente vietata al parcheggio di mezzi e materiali",
      "Un'area riservata ai soli veicoli ADR",
    ],
    correctIndex: 1,
    explanation:
      "La NPA (No Parking Area) è zona totalmente vietata al parcheggio di mezzi e materiali. Perché? Le NPA vengono create in aree dove il parcheggio ostacolerebbe la visibilità, i percorsi operativi o le vie di fuga di emergenza. 💡 Ricorda: NPA = «No Park Area» — nessun mezzo, nessun materiale, nessuna eccezione.",
    topic: "Segnaletica",
  },
  {
    id: "seg-06",
    question: "I pannelli a scacchi bianchi e neri posti sulle fiancate dei veicoli a cosa servono?",
    options: [
      "Indicano che il mezzo è autorizzato ad accedere in Area di Manovra",
      "Sono un elemento di conspicuous color per l'alta visibilità",
      "Identificano i mezzi ADR",
    ],
    correctIndex: 1,
    explanation:
      "I pannelli a scacchi bianchi e neri sulle fiancate dei veicoli sono un requisito di conspicuous color per l'alta visibilità. Perché? In un ambiente con aeromobili in movimento, il veicolo deve essere immediatamente distinguibile a distanza dai piloti in cabina di pilotaggio e dai marshaller. 💡 Ricorda: scacchi bianchi e neri = «guardami!» — come le giacche dei ciclisti di notte.",
    topic: "Segnaletica",
  },
  {
    id: "seg-07",
    question: "Cosa indica il segnale «Jet Blast»?",
    options: [
      "Che stiamo accedendo in area di manutenzione aeromobili",
      "Che potremmo essere colpiti dalla turbolenza generata dai motori degli aeromobili",
      "Che siamo in prossimità della pista di decollo",
    ],
    correctIndex: 1,
    explanation:
      "Il segnale Jet Blast avverte del rischio di turbolenza causata dai motori degli aeromobili. Perché? Il getto dei motori può rovesciare veicoli leggeri, proiettare oggetti come missili e ferire il personale: senza avviso, il rischio è invisibile ma letale. 💡 Ricorda: Jet Blast = vento artificiale potentissimo — a volte abbastanza forte da ribaltare un furgone.",
    topic: "Segnaletica",
  },
  {
    id: "seg-08",
    question: "La ABL (Apron Border Line) è una linea di colore:",
    options: ["Bianco", "Nero", "Rosso"],
    correctIndex: 2,
    explanation:
      "L'ABL (Apron Border Line) è una linea rossa che delimita il confine del piazzale. Perché? Attraversare l'ABL senza autorizzazione significa entrare nel percorso degli aeromobili: un veicolo che la attraversa può trovarsi davanti a un aereo in rullaggio. 💡 Ricorda: ABL rossa = confine invalicabile — come il bordo di una pista da corsa, non si attraversa senza autorizzazione.",
    topic: "Segnaletica",
  },

  // ── TAXIWAY E PIAZZOLE ────────────────────────────────────────────────────────
  {
    id: "tax-01",
    question: "Prima di attraversare una taxiway, qual è la distanza di sicurezza da mantenere dopo il passaggio di un aeromobile?",
    options: [
      "Almeno 50 metri dall'aeromobile",
      "Almeno 150 metri dall'aeromobile (o il doppio della lunghezza dell'aeromobile)",
      "Almeno 200 metri dall'aeromobile",
    ],
    correctIndex: 1,
    explanation:
      "Prima di attraversare una taxiway si deve attendere che l'aeromobile sia a 150 metri (o il doppio della sua lunghezza). Perché? A 10-15 km/h di velocità di rullaggio, 150 metri corrispondono a circa 30-40 secondi di reazione — il tempo minimo per attraversare in sicurezza. 💡 Ricorda: 150 metri = circa la lunghezza di un Boeing 747 e mezzo — devi vederlo «piccolo» prima di attraversare.",
    topic: "Taxiway e piazzole",
  },
  {
    id: "tax-02",
    question: "È possibile accedere in piazzola solo quando:",
    options: [
      "Quando l'aeromobile ha spento i motori",
      "Quando sono stati posizionati i tacchi (wheel chocks) e spenta la luce anticollisione",
      "Quando il comandante dell'aeromobile lo autorizza via radio",
    ],
    correctIndex: 1,
    explanation:
      "Si può accedere in piazzola solo quando i tacchi sono posizionati E la luce anticollisione (beacon) è spenta. Perché? I tacchi bloccano l'aereo; il beacon spento è il segnale convenzionale che il pilota ha terminato le manovre. Entrambe le condizioni devono essere soddisfatte. 💡 Ricorda: «Tacchi + Beacon spento = Via libera» — manca uno dei due? Non entrare.",
    topic: "Taxiway e piazzole",
  },
  {
    id: "tax-03",
    question: "Un aeromobile è da considerarsi a terra (operazioni di piazzola consentite) quando:",
    options: [
      "Quando tocca la touchdown zone (TDZ) della pista",
      "Quando libera la pista dopo l'atterraggio",
      "Successivamente allo spegnimento della luce anticollisione e al posizionamento dei tacchi",
    ],
    correctIndex: 2,
    explanation:
      "L'aeromobile è considerato a terra (operazioni consentite) solo dopo spegnimento del beacon E posizionamento dei tacchi. Perché? Il beacon acceso segnala che i motori potrebbero essere ancora attivi o che l'aereo potrebbe ancora muoversi: avvicinarsi prima è pericoloso. 💡 Ricorda: beacon acceso = aereo «vivo» — aspetta che si «spenga» prima di avvicinarti.",
    topic: "Taxiway e piazzole",
  },
  {
    id: "tax-04",
    question: "Le aree e gli stalli adiacenti alle piazzole di sosta possono essere utilizzati da:",
    options: [
      "Tutti gli operatori che abbiano esigenze operative",
      "Solo dai veicoli del gestore aeroportuale ADR",
      "Solo dai mezzi impegnati nell'assistenza del volo assegnato alla piazzola",
    ],
    correctIndex: 2,
    explanation:
      "Gli stalli adiacenti alla piazzola sono riservati esclusivamente ai mezzi impegnati nell'assistenza del volo assegnato a quella piazzola. Perché? Mezzi non assegnati al volo creano confusione, intralciano i percorsi operativi e aumentano il rischio di collisioni in un'area già congestionata. 💡 Ricorda: ogni piazzola ha il suo «team» — se non sei della squadra, non parcheggi lì.",
    topic: "Taxiway e piazzole",
  },
  {
    id: "tax-05",
    question: "La circolazione a piedi all'interno delle piazzole è consentita:",
    options: [
      "Solo per ragioni operative",
      "Soltanto in caso di emergenza",
      "Soltanto se autorizzata da ENAC",
    ],
    correctIndex: 0,
    explanation:
      "La circolazione a piedi nelle piazzole è consentita solo per ragioni operative connesse all'assistenza dell'aeromobile. Perché? Le piazzole sono ambienti ad alto traffico di mezzi pesanti: il pedone non deve trovarsi in piazzola per motivi non operativi, dove rischia di non essere visto. 💡 Ricorda: in piazzola a piedi solo se stai lavorando — niente passeggiate.",
    topic: "Taxiway e piazzole",
  },
  {
    id: "tax-06",
    question: "L'attraversamento delle vie di rullaggio sui piazzali:",
    options: [
      "Deve essere autorizzato dalla Torre di Controllo su richiesta della Sicurezza Operativa ADR",
      "È sempre indicato da segnaletica verticale",
      "Può avvenire solo in corrispondenza delle relative intersezioni con la strada di servizio",
    ],
    correctIndex: 2,
    explanation:
      "L'attraversamento della taxiway deve avvenire solo alle intersezioni previste (indicate dalla segnaletica). Perché? Le intersezioni hanno segnaletica specifica (stop aeronautico, marcature) che avvisa i conducenti; attraversare in punti non autorizzati è imprevedibile per i piloti degli aeromobili. 💡 Ricorda: taxiway = attraversa solo agli incroci — come attraversare la strada solo sulle strisce.",
    topic: "Taxiway e piazzole",
  },
  {
    id: "tax-07",
    question: "Scale e nastri trasportatori devono circolare:",
    options: [
      "In posizione di massima elevazione",
      "Scortati da un veicolo con apparecchio radio",
      "Sempre in posizione abbassata",
    ],
    correctIndex: 2,
    explanation:
      "Scale e nastri trasportatori devono sempre circolare in posizione abbassata. Perché? In posizione elevata aumentano il rischio di collisione con le parti dell'aeromobile (ali, impennaggi, motori) durante gli spostamenti tra piazzole o lungo la viabilità. 💡 Ricorda: abbassato = profilo basso = passa ovunque; alzato = rischio impatto con l'aereo.",
    topic: "Taxiway e piazzole",
  },
  {
    id: "tax-08",
    question: "Il transito e la sosta sotto le ali e sui pozzetti di rifornimento dell'aeromobile:",
    options: [
      "È consentito solo ai mezzi antincendio",
      "È consentito solo ai veicoli della compagnia aerea proprietaria dell'aeromobile",
      "È assolutamente vietato a chiunque",
    ],
    correctIndex: 2,
    explanation:
      "Il transito e la sosta sotto le ali e sui pozzetti di rifornimento sono assolutamente vietati a chiunque. Perché? Le ali contengono i serbatoi di carburante e i pozzetti gestiscono i flussi: sostare lì in caso di sversamento o anomalia significa essere esposti a rischio incendio. 💡 Ricorda: sotto le ali = zona rossa assoluta — neanche per «un secondo».",
    topic: "Taxiway e piazzole",
  },

  // ── PARCHEGGIO E SOSTA ───────────────────────────────────────────────────────
  {
    id: "par-01",
    question: "Lungo le vie di scorrimento (veicolari) è consentita la sosta dei veicoli?",
    options: [
      "Sì, sempre",
      "Solo se temporanea",
      "Mai, in nessun caso",
    ],
    correctIndex: 2,
    explanation:
      "Lungo le veicolari la sosta è vietata in qualsiasi circostanza. Perché? Le veicolari sono le arterie di scorrimento del traffico in Airside: un veicolo parcheggiato restringe la carreggiata e può causare situazioni pericolose in caso di emergenza che richieda il passaggio rapido. 💡 Ricorda: veicolare = autostrada interna — non si parcheggia, si scorre.",
    topic: "Parcheggio e sosta",
  },
  {
    id: "par-02",
    question: "Dove è vietato parcheggiare i veicoli in Airside?",
    options: [
      "Sotto la fusoliera o le ali di un aeromobile",
      "Sotto i pontili di imbarco",
      "Entrambe le precedenti",
    ],
    correctIndex: 2,
    explanation:
      "È vietato parcheggiare sotto la fusoliera/ali degli aeromobili e sotto i pontili di imbarco. Perché? Queste aree devono restare libere per consentire le operazioni di assistenza e per garantire vie di fuga sicure in caso di emergenza. 💡 Ricorda: tutto sotto l'aereo o sotto i pontili è fuori dai limiti — spazio sacro, sempre libero.",
    topic: "Parcheggio e sosta",
  },
  {
    id: "par-03",
    question: "Nel posizionarsi con un veicolo per assistere un aeromobile, occorre:",
    options: [
      "Parcheggiare in coda all'aeromobile",
      "Parcheggiare in fila indiana in ordine di arrivo",
      "Non chiudere il passaggio ad altri mezzi di assistenza già posizionati",
    ],
    correctIndex: 2,
    explanation:
      "Quando ci si posiziona per assistere un aeromobile non si deve ostruire il passaggio agli altri mezzi già in posizione. Perché? Ogni mezzo ha un compito specifico da svolgere entro tempi precisi; bloccare un collega significa ritardare il volo e compromettere la sequenza operativa. 💡 Ricorda: «prima chi c'era» — non intralciare chi è già al lavoro.",
    topic: "Parcheggio e sosta",
  },
  {
    id: "par-04",
    question: "I rifiuti di bordo in piazzola come devono essere trattati?",
    options: [
      "Possono essere lasciati temporaneamente vicino all'estintore",
      "Devono essere messi in sacchi identificativi chiusi",
      "Devono essere tenuti a bordo fino all'aerostazione",
    ],
    correctIndex: 1,
    explanation:
      "I rifiuti di bordo devono essere messi in sacchi identificativi chiusi. Perché? I sacchi aperti in piazzola sono un pericolo FOD: il vento da jet blast può disperdere il contenuto in tutta la piazzola e potenzialmente ingerirlo nel motore di un aeromobile. 💡 Ricorda: sacchi chiusi = nessun FOD volante — anche un fazzolettino può danneggiare un motore.",
    topic: "Parcheggio e sosta",
  },

  // ── VIABILITÀ E MANOVRA ───────────────────────────────────────────────────────
  {
    id: "via-01",
    question: "Per uscire dalla viabilità veicolare, come si deve effettuare la svolta?",
    options: [
      "Con una inversione ad «U»",
      "Con una svolta ad angolo retto (90°)",
      "Accostando con una svolta a 45°",
    ],
    correctIndex: 1,
    explanation:
      "Per uscire dalla viabilità veicolare si effettua una svolta a 90°, non diagonale né ad «U». Perché? Una svolta a 90° è prevedibile per gli altri conducenti e si completa in meno spazio rispetto a curve diagonali o inversioni, riducendo il tempo di esposizione al rischio. 💡 Ricorda: 90° = angolo retto = la svolta più sicura e prevedibile.",
    topic: "Viabilità",
  },
  {
    id: "via-02",
    question: "Lungo le vie di scorrimento è consentito lasciare attrezzature e materiale?",
    options: [
      "Sì, se non ostacola la viabilità",
      "Solo temporaneamente",
      "Mai, in nessun caso",
    ],
    correctIndex: 2,
    explanation:
      "Lungo le vie di scorrimento non è mai consentito lasciare attrezzature o materiale. Perché? Qualsiasi oggetto lasciato sulla viabilità può diventare un FOD se investito da un veicolo, o può causare un incidente se un conducente lo evita bruscamente. 💡 Ricorda: veicolare sempre libera — niente lasciato, nemmeno temporaneamente.",
    topic: "Viabilità",
  },
  {
    id: "via-03",
    question: "Chi può circolare sulle taxiway (vie di rullaggio principali in Area di Manovra)?",
    options: [
      "I mezzi della Polizia di Stato",
      "I mezzi della Sicurezza Operativa ADR",
      "Solo i veicoli dotati di apparato radio UHF in contatto con la Torre di Controllo (o scortati da tali mezzi)",
    ],
    correctIndex: 2,
    explanation:
      "In Area di Manovra possono circolare solo veicoli con radio UHF in contatto con la Torre di Controllo (TWR), o scortati da tali mezzi. Perché? La TWR coordina tutti i movimenti in Area di Manovra: senza comunicazione radio diretta, un veicolo potrebbe trovarsi sul percorso di un aereo in decollo. 💡 Ricorda: Area di Manovra = collegamento con la TWR obbligatorio — senza radio, non entri.",
    topic: "Viabilità",
  },
  {
    id: "via-04",
    question: "Il passaggio dei mezzi sotto i pontili di imbarco:",
    options: [
      "È sempre consentito a tutti i mezzi operativi",
      "È sempre vietato da apposita segnaletica",
      "È vietato ai veicoli di altezza superiore a quella indicata da apposita segnaletica",
    ],
    correctIndex: 2,
    explanation:
      "Il passaggio sotto i pontili è vietato ai veicoli con altezza superiore al limite indicato dalla segnaletica. Perché? Un veicolo troppo alto che passa sotto un pontile lo danneggerebbe gravemente, creando un'emergenza strutturale nell'area di imbarco e rischi per i passeggeri. 💡 Ricorda: controlla sempre l'altezza del tuo mezzo prima di passare sotto — come i camion al casello autostradale.",
    topic: "Viabilità",
  },
  {
    id: "via-05",
    question: "La strada perimetrale è accessibile:",
    options: [
      "Solo da chi ha ADC di tipo A",
      "Solo da chi ha ADC di tipo M",
      "Solo da personale espressamente autorizzato dalla Polizia e dal gestore aeroportuale",
    ],
    correctIndex: 2,
    explanation:
      "La strada perimetrale è accessibile solo a personale espressamente autorizzato da Polizia e ADR, anche se si ha l'ADC. Perché? La strada perimetrale corre lungo il confine aeroportuale: il suo utilizzo improprio potrebbe compromettere la sicurezza perimetrale dell'intero aeroporto. 💡 Ricorda: ADC non è sufficiente per la perimetrale — serve un'autorizzazione specifica in più.",
    topic: "Viabilità",
  },
  {
    id: "via-06",
    question: "Nella circolazione sulle vie di scorrimento, è consentito prendere scorciatoie uscendo dalla viabilità?",
    options: [
      "Sì, per motivi operativi urgenti",
      "Mai, in nessun caso",
      "Sì, quando possibile, per ridurre i tempi",
    ],
    correctIndex: 1,
    explanation:
      "Non è mai consentito prendere scorciatoie uscendo dalla viabilità veicolare designata. Perché? Le scorciatoie portano su aree non controllate, potenzialmente occupate da aeromobili o attrezzature: il percorso designato è l'unico verificato come sicuro. 💡 Ricorda: non esistono scorciatoie sicure in Airside — il percorso designato è l'unico percorso.",
    topic: "Viabilità",
  },

  // ── RIFORNIMENTO ─────────────────────────────────────────────────────────────
  {
    id: "rif-01",
    question: "Durante le operazioni di rifornimento carburante, nessun estraneo può:",
    options: [
      "Avvicinarsi entro 50 metri dal mezzo rifornitore",
      "Trovarsi all'interno della zona di sicurezza",
      "Restare a bordo del proprio veicolo nelle vicinanze",
    ],
    correctIndex: 1,
    explanation:
      "Durante il rifornimento nessun estraneo può trovarsi all'interno della zona di sicurezza. Perché? Il carburante aereo è altamente infiammabile: la presenza di personale non autorizzato aumenta il rischio di incidenti (scintille, fumo, urti) in un'area ad alto rischio incendio. 💡 Ricorda: zona di sicurezza = perimetro sacro — solo chi serve al rifornimento, nessun altro.",
    topic: "Rifornimento",
  },
  {
    id: "rif-02",
    question: "Durante le operazioni di rifornimento carburante, dove deve essere posizionata la parte del mezzo contenente il motore?",
    options: [
      "Può essere parcheggiata in base alla zona libera disponibile",
      "Deve essere parcheggiata di fronte al muso dell'aeromobile",
      "Non deve mai sostare sotto l'ala dell'aeromobile",
    ],
    correctIndex: 2,
    explanation:
      "La parte dell'autocisterna con il motore non deve mai sostare sotto l'ala dell'aeromobile. Perché? Il motore dell'autocisterna produce scintille e calore: in caso di perdita di carburante dai serbatoi nell'ala, potrebbe innescare un incendio. 💡 Ricorda: motore cisterna + carburante dell'ala = pericolo incendio — tengili separati.",
    topic: "Rifornimento",
  },
  {
    id: "rif-03",
    question: "In caso di piccolo sversamento di carburante, cosa occorre fare immediatamente?",
    options: [
      "Utilizzare immediatamente gli estintori posizionati in piazzola",
      "Spostare immediatamente il mezzo rifornitore",
      "Contattare immediatamente il CEA ADR",
    ],
    correctIndex: 2,
    explanation:
      "In caso di sversamento di idrocarburi contattare immediatamente il CEA ADR. Perché? Anche un piccolo sversamento di kerosene può innescarsi in pochi secondi: solo personale specializzato del CEA ha i mezzi per intervenire correttamente. 💡 Ricorda: sversamento = chiama il CEA subito — non tentare di pulire da solo.",
    topic: "Rifornimento",
  },
  {
    id: "rif-04",
    question: "In quali luoghi è consentito fumare in Airside?",
    options: [
      "All'interno del proprio veicolo",
      "In prossimità delle piazzole di sosta aeromobili",
      "Negli appositi smoking point dislocati in luoghi sicuri dell'Airside",
    ],
    correctIndex: 2,
    explanation:
      "Il fumo è consentito solo negli appositi smoking point, non in piazzola, non a bordo dei veicoli. Perché? In Airside vi sono aree con vapori di carburante che potrebbero innescarsi con una singola scintilla: fumare fuori dalle zone designate è potenzialmente letale. 💡 Ricorda: smoking point = l'unico posto sicuro — ovunque altro è un rischio d'incendio.",
    topic: "Rifornimento",
  },

  // ── EMERGENZE E CEA ───────────────────────────────────────────────────────────
  {
    id: "eme-01",
    question: "A chi deve essere immediatamente comunicato qualsiasi inconveniente/incidente in Airside?",
    options: [
      "All'ENAC",
      "Alla compagnia aerea",
      "Al CEA ADR – Coordinamento Emergenze Airside (tel. 06 65953022)",
    ],
    correctIndex: 2,
    explanation:
      "Qualsiasi inconveniente/incidente in Airside va comunicato immediatamente al CEA ADR. Perché? Il CEA coordina tutte le risorse di emergenza; una segnalazione tempestiva permette di attivare i soccorsi, contenere il rischio e documentare l'evento prima che la situazione peggiori. 💡 Ricorda: CEA = «112 dell'Airside» — primo numero da chiamare per qualsiasi problema.",
    topic: "Emergenze",
  },
  {
    id: "eme-02",
    question: "Il GSR (Ground Safety Report) deve essere redatto:",
    options: [
      "Solo in caso di incidente tra mezzi circolanti in Airside",
      "Solo per segnalare comportamenti o condizioni pericolose",
      "In entrambi i casi precedenti",
    ],
    correctIndex: 2,
    explanation:
      "Il GSR deve essere redatto sia per incidenti tra mezzi sia per segnalare comportamenti o condizioni pericolose. Perché? La segnalazione sistematica anche di quasi-incidenti e comportamenti pericolosi permette di identificare e correggere i rischi prima che causino danni reali. 💡 Ricorda: GSR non è solo per quando succede qualcosa — segnala anche quando «ci mancava poco».",
    topic: "Emergenze",
  },
  {
    id: "eme-03",
    question: "In caso di incidente aereo, i mezzi di soccorso possono derogare a:",
    options: [
      "Il rispetto dei limiti di velocità",
      "L'obbligo di dare precedenza agli aeromobili",
      "Entrambe le precedenti",
    ],
    correctIndex: 2,
    explanation:
      "In emergenza aeronautica i mezzi di soccorso possono derogare ai limiti di velocità e all'obbligo di dare precedenza agli aeromobili. Perché? In un'emergenza ogni secondo conta per salvare vite: la legislazione permette ai soccorritori di violare le regole ordinarie perché il beneficio (vite salvate) supera il rischio. 💡 Ricorda: soccorso in emergenza = carta bianca — velocità e precedenze sospese.",
    topic: "Emergenze",
  },
  {
    id: "eme-04",
    question: "In caso di veicolo in avaria o incertezza sulla propria posizione in Airside, cosa deve fare il conducente?",
    options: [
      "Continuare a guidare lentamente verso l'uscita più vicina",
      "Fermarsi in una zona sicura, inserire i lampeggianti di emergenza e contattare il CEA/Sicurezza Operativa",
      "Chiedere soccorso ad altri conducenti che passano",
    ],
    correctIndex: 1,
    explanation:
      "In caso di avaria o incertezza sulla posizione: fermarsi in zona sicura, attivare i lampeggianti, contattare CEA/Sicurezza Operativa. Perché? Un veicolo fermo e visibile è meno pericoloso di uno che vaga cercando l'uscita: lampeggianti e chiamata permettono di gestire la situazione in modo controllato. 💡 Ricorda: «Fermati, segnalati, chiama» — i tre passi dell'emergenza veicolo.",
    topic: "Emergenze",
  },

  // ── BASSA VISIBILITÀ ──────────────────────────────────────────────────────────
  {
    id: "bvi-01",
    question: "In condizioni di bassa visibilità (LVP - Low Visibility Procedures) è d'obbligo per tutti i mezzi:",
    options: [
      "Aumentare la velocità per ridurre il tempo di esposizione al rischio",
      "Tenere i fari anabbaglianti accesi, procedere con massima cautela, ridurre velocità e prestare particolare attenzione agli attraversamenti delle taxiway",
      "Sospendere immediatamente ogni operazione e rientrare ai capannoni",
    ],
    correctIndex: 1,
    explanation:
      "In LVP: fari anabbaglianti accesi, velocità ridotta, attenzione speciale agli attraversamenti taxiway. Perché? In bassa visibilità gli aeromobili non si vedono fino a pochi metri: rispettare queste precauzioni è l'unico modo per avere il tempo minimo di reazione. 💡 Ricorda: LVP = «modalità extra-cauta» — triplo controllo a ogni attraversamento taxiway.",
    topic: "Bassa visibilità",
  },
  {
    id: "bvi-02",
    question: "Le scorte a veicoli non impegnati in un'emergenza sono sospese quando:",
    options: [
      "C'è forte vento superiore a 30 nodi",
      "Sono attivate le LVP (Low Visibility Procedures)",
      "È presente neve o ghiaccio sulla pista",
    ],
    correctIndex: 1,
    explanation:
      "Le scorte a veicoli non di emergenza vengono sospese automaticamente in caso di attivazione delle LVP. Perché? In bassa visibilità anche il veicolo scortante fatica a vedere: aggiungere veicoli non urgenti in Area di Manovra aumenterebbe esponenzialmente il rischio di incidenti. 💡 Ricorda: LVP = solo emergenze scortate — tutti gli altri mezzi non urgenti restano fermi.",
    topic: "Bassa visibilità",
  },

  // ── DOTAZIONE VEICOLI ─────────────────────────────────────────────────────────
  {
    id: "dot-01",
    question: "I veicoli che circolano in Airside devono essere dotati di un adesivo con:",
    options: [
      "Il logo ENAC e la targa del mezzo",
      "Il QR-code «Quick References di Aeroporti di Roma» (min. 5x5 cm)",
      "Il numero seriale dell'ADC del conducente",
    ],
    correctIndex: 1,
    explanation:
      "I veicoli in Airside devono avere l'adesivo con QR-code ADR (min. 5x5 cm). Perché? Il QR-code fornisce accesso immediato alle procedure operative e ai riferimenti di emergenza: in caso di bisogno, il conducente può consultarle rapidamente senza cercarne una copia cartacea. 💡 Ricorda: QR-code = «manuale di sicurezza» sempre con te sul veicolo.",
    topic: "Dotazione veicoli",
  },
  {
    id: "dot-02",
    question: "Tutti gli operatori che operano in Airside devono indossare:",
    options: [
      "Solo il TIA (tesserino di ingresso aeroportuale)",
      "Solo il giubbino ad alta visibilità",
      "Entrambi: TIA e giubbino ad alta visibilità",
    ],
    correctIndex: 2,
    explanation:
      "In Airside vanno indossati sempre sia il TIA (ben esposto) sia il giubbino ad alta visibilità. Perché? Il TIA attesta l'identità e l'autorizzazione; il giubbino garantisce che il personale sia visibile ai piloti in cabina e ai conducenti di altri mezzi, riducendo il rischio di investimento. 💡 Ricorda: TIA + giubbino = la «divisa» minima obbligatoria in Airside — entrambi, non uno solo.",
    topic: "Dotazione veicoli",
  },
  {
    id: "dot-03",
    question: "Per i veicoli che circolano in Airside, la consultazione della documentazione tramite QR-code:",
    options: [
      "È sempre consentita, purché si guidi lentamente",
      "È vietata durante la guida; è consentita solo a mezzo fermo in posizione sicura",
      "È consentita solo al passeggero, non al conducente",
    ],
    correctIndex: 1,
    explanation:
      "La consultazione del QR-code è vietata durante la guida; si può fare solo a veicolo fermo in posizione sicura. Perché? Consultare lo smartphone o un dispositivo durante la guida è una distrazione grave: anche un secondo di sguardo lontano dalla strada può causare un incidente con conseguenze severe. 💡 Ricorda: QR-code = solo a mezzo fermo — come il navigatore: non si programma mentre si guida.",
    topic: "Dotazione veicoli",
  },

  // ── AREA DI MANOVRA ──────────────────────────────────────────────────────────
  {
    id: "man-01",
    question: "L'Area di Manovra è accessibile da:",
    options: [
      "Tutti gli operatori che abbiano esigenze operative",
      "Solo il personale in possesso di ADC tipo M e con mezzo in collegamento radio UHF con la Torre di Controllo",
      "Solo dal personale specializzato ENAV",
    ],
    correctIndex: 1,
    explanation:
      "L'Area di Manovra è accessibile solo con ADC-M e radio UHF in contatto con la Torre (TWR), o scortati da tali mezzi. Perché? In Area di Manovra operano aeromobili in decollo e atterraggio ad alta velocità: senza coordinamento diretto con la TWR, un veicolo può finire sulla traiettoria di un aereo. 💡 Ricorda: Area di Manovra = piste = zona di massimo pericolo — ADC-M + radio TWR obbligatori.",
    topic: "Area di Manovra",
  },
  {
    id: "man-02",
    question: "L'Area di Manovra è composta da:",
    options: [
      "Piste di volo e vie di rullaggio adiacenti (taxiway principali)",
      "Piste di volo e piazzali",
      "Veicolari e strada perimetrale",
    ],
    correctIndex: 0,
    explanation:
      "L'Area di Manovra = piste di volo + taxiway principali. I piazzali NON ne fanno parte. Perché? Piste e taxiway principali sono le infrastrutture dove gli aeromobili si muovono più velocemente: la distinzione con i piazzali serve a calibrare i requisiti di accesso al livello di rischio. 💡 Ricorda: Manovra = piste + taxiway (aerei veloci); Apron = piazzali (aerei fermi o lenti).",
    topic: "Area di Manovra",
  },

  // ── ACCESSO SENZA ADC ─────────────────────────────────────────────────────────
  {
    id: "sco-01",
    question: "Chi deve accedere in Airside senza essere in possesso di ADC deve:",
    options: [
      "Esibire la patente di tipo B agli organi competenti",
      "Essere scortato dalla Sicurezza Operativa ADR",
      "Essere scortato dagli Enti di Stato esclusivamente in Area di Manovra",
    ],
    correctIndex: 1,
    explanation:
      "Senza ADC è obbligatorio essere scortati dalla Sicurezza Operativa ADR. Perché? Chi non ha l'ADC non conosce le regole operative, la segnaletica e i percorsi sicuri: la scorta garantisce che si muova correttamente senza mettere a rischio se stesso e gli aeromobili. 💡 Ricorda: senza ADC = non puoi muoverti da solo — serve sempre qualcuno che «conosce le strade».",
    topic: "Accesso senza ADC",
  },
  {
    id: "sco-02",
    question: "In caso di perdita del contatto visivo durante una scorta, cosa deve fare lo scortato?",
    options: [
      "Continuare verso la destinazione e attendere lo scortante",
      "Moderare la velocità fino a fermarsi in zona sicura e attendere il ripristino del contatto visivo",
      "Contattare immediatamente ENAC",
    ],
    correctIndex: 1,
    explanation:
      "In caso di perdita del contatto visivo con lo scortante: ridurre la velocità, fermarsi in zona sicura, attendere il ripristino del contatto. Perché? Senza scortante un veicolo senza ADC è «perso» in Airside: fermarsi previene che si avventuri in aree pericolose o che blocchi percorsi operativi. 💡 Ricorda: scortante sparito = stop immediato — non continuare da solo neanche per un metro.",
    topic: "Accesso senza ADC",
  },

  // ── MEZZI SPECIALI ────────────────────────────────────────────────────────────
  {
    id: "mez-01",
    question: "L'automezzo antincendio e l'autoambulanza in emergenza (luce blu accesa) hanno la precedenza:",
    options: [
      "Su tutti i veicoli ma non sugli aeromobili",
      "Su tutti i veicoli compresi gli aeromobili in rullaggio",
      "Solo sulle veicolari, non in piazzola",
    ],
    correctIndex: 1,
    explanation:
      "I mezzi di emergenza (antincendio/ambulanza) con luce blu hanno precedenza assoluta su tutti, compresi gli aeromobili in rullaggio. Perché? Un ritardo di un mezzo di soccorso in un'emergenza aeronautica può significare la differenza tra vita e morte: nulla può ostacolarli. 💡 Ricorda: blu + sirena = priorità assoluta — anche davanti a un Boeing 737 che rulla.",
    topic: "Mezzi speciali",
  },
  {
    id: "mez-02",
    question: "Il mezzo sgombraneve in Airside ha l'obbligo di:",
    options: [
      "Procedere sempre scortato da un veicolo ADR",
      "Collegamento radio con la Torre di Controllo (TWR)",
      "Nessun requisito aggiuntivo rispetto agli altri mezzi",
    ],
    correctIndex: 1,
    explanation:
      "I mezzi sgombraneve hanno l'obbligo di collegamento radio con la Torre di Controllo (TWR). Perché? Durante le operazioni neve, la visibilità è ridotta e i movimenti degli aerei sulla pista devono essere coordinati con lo sgombero: senza radio, rischiano di trovarsi sulla pista durante un atterraggio. 💡 Ricorda: sgombraneve + neve = visibilità zero + pista occupata — la radio con la TWR è vitale.",
    topic: "Mezzi speciali",
  },
  {
    id: "mez-03",
    question: "Il bus interpista è dotato di apparato radio per la comunicazione con la Torre di Controllo?",
    options: [
      "Sì, sempre",
      "Solo a Fiumicino",
      "No",
    ],
    correctIndex: 2,
    explanation:
      "Il bus interpista non è dotato di radio per la comunicazione con la TWR. Perché? Il bus circola solo nell'area dei piazzali e lungo le veicolari, non in Area di Manovra: in queste zone non è necessario il coordinamento diretto con la Torre. 💡 Ricorda: bus interpista = solo piazzali e veicolari — niente piste, niente radio TWR.",
    topic: "Mezzi speciali",
  },

  // ── NORMATIVA ─────────────────────────────────────────────────────────────────
  {
    id: "nor-01",
    question: "La circolazione in Airside è disciplinata da:",
    options: [
      "Solo dal Codice della Strada",
      "Solo dal Manuale di Aeroporto",
      "Dal Regolamento EU 139/2014, dal Manuale di Aeroporto e dal Codice della Strada",
    ],
    correctIndex: 2,
    explanation:
      "La circolazione in Airside è disciplinata dal Reg. EU 139/2014, dal Manuale di Aeroporto e dal Codice della Strada. Perché? L'Airside è un ambiente che combina infrastrutture aeronautiche (regolate dall'UE) con veicoli stradali (regolati dal Codice della Strada): serve un framework normativo multi-livello. 💡 Ricorda: EU 139/2014 + Manuale ADR + Codice della Strada = tre livelli normativi sovrapposti.",
    topic: "Normativa",
  },
  {
    id: "nor-02",
    question: "ADR (Aeroporti di Roma) è:",
    options: [
      "Un operatore aeroportuale",
      "La società incaricata per legge a gestire e amministrare le infrastrutture aeroportuali di Roma",
      "Un'autorità aeronautica di regolazione",
    ],
    correctIndex: 1,
    explanation:
      "ADR (Aeroporti di Roma) è il gestore aeroportuale incaricato di amministrare FCO e CIA. Perché? In quanto gestore, ADR ha la responsabilità diretta della sicurezza operativa degli scali: emette le regole ADC, gestisce la Sicurezza Operativa e risponde agli enti regolatori. 💡 Ricorda: ADR = il «proprietario di casa» — decide le regole, fa rispettare le norme.",
    topic: "Normativa",
  },
  {
    id: "nor-03",
    question: "ENAC è:",
    options: [
      "L'ente che gestisce il traffico aereo civile in Italia",
      "L'autorità di regolazione tecnica, certificazione, vigilanza e controllo nel settore dell'aviazione civile italiana",
      "La società che gestisce gli aeroporti di Roma",
    ],
    correctIndex: 1,
    explanation:
      "ENAC è l'autorità italiana di regolazione, certificazione e vigilanza nell'aviazione civile. Perché? Un'autorità indipendente garantisce che le regole siano rispettate anche dai gestori aeroportuali: ENAC è il «controllore dei controllori». 💡 Ricorda: ENAC = «polizia del cielo» — regola, certifica e vigila su tutto il settore.",
    topic: "Normativa",
  },
  {
    id: "nor-04",
    question: "ENAV ha il compito di:",
    options: [
      "Gestire le infrastrutture aeroportuali",
      "Istruire il movimento degli aeromobili e dei veicoli in Area di Manovra",
      "Rilasciare le ADC ai conducenti",
    ],
    correctIndex: 1,
    explanation:
      "ENAV gestisce il traffico aereo civile italiano e in Area di Manovra istruisce i movimenti di aeromobili e veicoli. Perché? Il coordinamento dei movimenti di aeromobili e veicoli sul campo è indispensabile per evitare collisioni: ENAV ha la visione d'insieme che i singoli conducenti non possono avere. 💡 Ricorda: ENAV = «torre di controllo» — la TWR è ENAV.",
    topic: "Normativa",
  },

  // ── INIBIZIONE ALLA GUIDA ─────────────────────────────────────────────────────
  {
    id: "ini-01",
    question: "L'inibizione alla guida in Airside è prevista in caso di:",
    options: [
      "Solo patente di guida civile scaduta",
      "Solo mancata effettuazione del recurrent training",
      "Entrambi: patente di guida civile scaduta o mancata effettuazione del recurrent/refresher training",
    ],
    correctIndex: 2,
    explanation:
      "Il datore di lavoro deve inibire il conducente se: patente civile scaduta, recurrent training non effettuato, o refresher training mancante. Perché? L'ADC è valida solo se supportata da un sistema di qualifiche aggiornate: permettere la guida con documenti scaduti viola la normativa e mette a rischio la sicurezza. 💡 Ricorda: il datore di lavoro è responsabile — se non controlla le scadenze, è colpa sua.",
    topic: "Inibizione",
  },

  // ── DISTANZE DI SICUREZZA ─────────────────────────────────────────────────────
  {
    id: "dis-01",
    question: "La distanza di sicurezza tra i veicoli in Airside è obbligatoria:",
    options: [
      "Solo sulle veicolari",
      "Solo in condizioni di scarsa visibilità",
      "Sempre, in qualsiasi area di Airside",
    ],
    correctIndex: 2,
    explanation:
      "La distanza di sicurezza tra veicoli è obbligatoria sempre, in qualsiasi area di Airside. Perché? Fermate improvvise sono frequenti in Airside (precedenza agli aeromobili, stop aeronautico, emergenze): senza distanza di sicurezza, il tamponamento è quasi inevitabile. 💡 Ricorda: in Airside si frena spesso e improvvisamente — mantieni sempre la distanza.",
    topic: "Distanze di sicurezza",
  },

  // ── DOMANDE CON IMMAGINE ──────────────────────────────────────────────────────
  {
    id: "img-01",
    question:
      "Cosa indicano i tratti bianchi alternati (tratteggiati) sui bordi laterali della viabilità veicolare in questo punto?",
    options: [
      "La fine della strada veicolare: è obbligatorio fermarsi",
      "La viabilità sta attraversando un'area di movimento aeromobili (taxiway o taxilane): procedere con cautela dopo aver verificato l'assenza di aeromobili",
      "Un'area di parcheggio temporaneo autorizzata per i mezzi di servizio",
    ],
    correctIndex: 1,
    explanation:
      "I bordi laterali tratteggiati alternati indicano che la viabilità sta attraversando una taxiway/taxilane: fermarsi allo stop aeronautico e verificare l'assenza di aeromobili prima di attraversare. Perché? Le taxiway non hanno semafori: la segnaletica è l'unico avviso che stai per attraversare il percorso di un aeromobile. 💡 Ricorda: bordi a scacchi/tratteggiati = sei in zona di attraversamento aereo — fermati e guarda.",
    topic: "Segnaletica",
    imageUrl: "/images/taxiway-crossing-fco.png",
  },
  {
    id: "img-02",
    question:
      "Osserva questa planimetria dello scalo di Ciampino. Cosa indica la linea gialla continua al centro della viabilità e il simbolo rosso «divieto» sul lato sinistro?",
    options: [
      "La linea gialla è il margine della pista; il simbolo rosso indica un'area di manutenzione",
      "La linea gialla è il centerline della taxiway (via di rullaggio degli aeromobili); il simbolo rosso indica il punto di stop aeronautico per i veicoli",
      "La linea gialla segna la corsia preferenziale per i bus interpista; il simbolo rosso è la NPA",
    ],
    correctIndex: 1,
    explanation:
      "La linea gialla continua è il centerline della taxiway (riservata agli aeromobili); il simbolo rosso è lo stop aeronautico per i veicoli. Perché? A CIA gli spazi sono ridotti e la taxiway è vicina alla viabilità: la segnaletica combinata garantisce che nessun conducente possa ignorare il punto di stop. 💡 Ricorda: giallo = percorso aerei; rosso = fermati tu.",
    topic: "Segnaletica",
    imageUrl: "/images/taxiway-crossing-cia.png",
  },
  {
    id: "img-03",
    question:
      "Nell'immagine aerea, cosa identifica la linea rossa continua orizzontale marcata con la sigla «ABL»?",
    options: [
      "La NPA (No Parking Area): zona vietata alla sosta ma percorribile",
      "L'Apron Border Line: il confine tra la viabilità veicolare e l'area riservata al traffico degli aeromobili. Non deve mai essere oltrepassata dai veicoli",
      "Il perimetro della ERA (Equipment Restriction Area): zona ad accesso limitato per i mezzi di rampa",
    ],
    correctIndex: 1,
    explanation:
      "L'ABL (Apron Border Line) è la linea rossa che delimita il confine tra viabilità veicolare e area degli aeromobili. Non va mai oltrepassata senza autorizzazione. Perché? Oltre la ABL si entra nel percorso degli aeromobili: un veicolo che la attraversa senza autorizzazione può trovarsi davanti a un aereo in rullaggio. 💡 Ricorda: ABL rossa = confine invalicabile — come il bordo di una pista da corsa.",
    topic: "Segnaletica",
    imageUrl: "/images/abl-aerial.png",
  },
  {
    id: "img-04",
    question: "Cosa indica questo segnale verticale posizionato sulla viabilità in Airside?",
    options: [
      "Divieto di accesso all'area cargo: solo veicoli autorizzati",
      "Stop aeronautico: possibile incrocio con aeromobili in rullaggio — fermarsi e verificare prima di attraversare",
      "Rallentare: zona di manutenzione aeromobili nelle vicinanze",
    ],
    correctIndex: 1,
    explanation:
      "Il cartello «STOP – AEREI IN RULLAGGIO» è il segnale verticale di stop aeronautico: fermarsi completamente, verificare tutte le direzioni, poi attraversare. Perché? Il segnale verticale è visibile da lontano e in qualsiasi condizione atmosferica: è il complemento verticale dello stop orizzontale dipinto sull'asfalto. 💡 Ricorda: segnale rosso = STOP completo — non rallentare, fermarsi del tutto.",
    topic: "Segnaletica",
    imageUrl: "/images/stop-aeronautico.png",
  },
  {
    id: "img-05",
    question:
      "Cosa indicano questa segnaletica orizzontale dipinta sul manto stradale e il segnale verticale di STOP visibile sullo sfondo?",
    options: [
      "Zona di manutenzione temporanea della pista: accesso vietato a tutti i veicoli",
      "Accesso vietato alla Runway Strip (RWY STRIP NO ENTRY): oltre questo punto inizia l'area della pista di volo, vietata ai veicoli non autorizzati",
      "Area di sosta riservata ai veicoli di emergenza in attesa",
    ],
    correctIndex: 1,
    explanation:
      "Il marking «RWY STRIP NO ENTRY» (rosso su fondo grigio) e il STOP indicano il confine della Runway Strip: vietato ai veicoli non autorizzati. Perché? La RWY Strip è l'area di sicurezza ai lati della pista: i veicoli che la invadono sono invisibili ai piloti in atterraggio e a rischio investimento. 💡 Ricorda: RWY STRIP = zona pista — MAI entrare senza TWR che ti autorizza.",
    topic: "Segnaletica",
    imageUrl: "/images/rwy-no-entry.png",
  },
  {
    id: "img-06",
    question:
      "In questo schema di piazzola aeromobile, cosa identifica la sigla «ESA» (area arancione al centro in basso)?",
    options: [
      "Equipment Service Area: l'area di attesa/servizio per i mezzi di rampa in coda all'aeromobile, prima della Stop Line",
      "Emergency Safety Area: zona riservata ai soli mezzi di soccorso durante l'assistenza",
      "Equipment Restriction Area: zona ad accesso limitato, percorribile solo da mezzi con ADC-M",
    ],
    correctIndex: 0,
    explanation:
      "ESA (Equipment Service Area) è la zona di attesa per i mezzi di rampa, tra la barra di allineamento e la stop line, prima di avanzare verso l'aeromobile. Perché? Avere un'area di attesa ordinata evita ingorghi attorno all'aereo e mantiene liberi i percorsi per i mezzi prioritari (rifornimento, scala passeggeri). 💡 Ricorda: ESA = «sala d'attesa» — aspetta qui fino al tuo turno di servizio.",
    topic: "Taxiway e piazzole",
    imageUrl: "/images/piazzola-stand.png",
  },
  {
    id: "img-07",
    question:
      "Sempre nello stesso schema di piazzola, cosa identifica la sigla «ERL» (linea tratteggiata rossa sui lati)?",
    options: [
      "Emergency Response Line: il percorso riservato ai mezzi di soccorso in emergenza",
      "Equipment Restriction Line: la linea che delimita l'ERA (Equipment Restriction Area), zona ad accesso limitato per i mezzi di rampa",
      "Extended Runway Line: il prolungamento virtuale dell'asse pista fino alla piazzola",
    ],
    correctIndex: 1,
    explanation:
      "ERL (Equipment Restriction Line) è la linea tratteggiata rossa che delimita l'ERA (Equipment Restriction Area). I mezzi di rampa non possono entrare nell'ERA senza specifica autorizzazione operativa. Perché? L'ERA protegge le parti più vulnerabili dell'aeromobile (fusoliera bassa, carrello, stive): limitare l'accesso riduce il rischio di danneggiamenti durante le operazioni di rampa. 💡 Ricorda: ERL = linea rossa tratteggiata = confine ERA — attraversare solo se il tuo lavoro lo richiede.",
    topic: "Taxiway e piazzole",
    imageUrl: "/images/piazzola-stand.png",
  },
];
