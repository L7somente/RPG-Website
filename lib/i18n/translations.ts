// Central translation dictionary. Every user-facing string in the app is
// wired up to call t("key") from useLanguage(). Add a new key here (both
// languages) whenever new UI text is added.

export type Lang = "en" | "pt";

export const translations: Record<Lang, Record<string, string>> = {
  en: {
    // Sidebar
    home: "Home",
    accountSettings: "Account Settings",
    logout: "Log Out",
    language: "Language",

    // XP bar
    worldLevel: "World Level",

    // Dashboard header
    campaignDashboard: "Campaign dashboard",
    dmPanel: "DM Panel",
    adminPanel: "Admin Panel",
    myCharacters: "My Characters",
    dashboardLink: "Dashboard",

    // Login
    enterTheTavern: "Enter the Tavern",
    email: "Email",
    password: "Password",
    signIn: "Sign In",
    signInWithDiscord: "Sign in with Discord",
    discordOnlyNotice: "Accounts are created and managed through Discord only.",
    invalidCredentials: "Invalid email or password.",

    // Account page
    accountTitle: "Account Settings",
    username: "Username",
    usernameChatNotice: "This is the name shown in Party Chat, on the site and on Discord.",
    saveChanges: "Save Changes",
    changePassword: "Change Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    updatePassword: "Update Password",
    savedSuccessfully: "Saved.",
    role: "Role",

    // Quest Board
    questBoard: "Quest Board",
    questBoardHint: "Only shows quests from Masters who have an upcoming session scheduled.",
    noQuestsAvailable: "No quests available right now — check back once a Master schedules a session.",
    masterLabel: "Master",
    statusAvailable: "Available",
    statusActive: "In Progress",
    vote: "Vote",
    voted: "Voted",

    // Notice Board
    dmNoticeBoard: "DM Notice Board",
    noAnnouncementsYet: "No announcements yet.",
    pinned: "PINNED",

    // Session Schedule
    upcomingSessions: "Upcoming Sessions",
    nothingScheduled: "Nothing on the calendar yet.",
    confirmed: "Confirmed",
    joinedWith: "You joined with",
    leave: "Leave",
    createCharacterToJoin: "Create a character to join.",
    chooseCharacter: "Choose character…",
    join: "Join",

    // Mission Log
    missionLog: "Mission Log",
    noCompletedQuests: "No completed quests yet.",

    // Discord Chat
    partyChat: "Party Chat",
    syncedWithDiscord: "synced with Discord",
    messageThePlaceholder: "Message the party…",
    loginToChat: "Log in to chat",
    send: "Send",

    // Characters page
    yourCharacters: "Your Characters",
    slotsUsed: "slots used",
    newCharacter: "+ New Character",
    emptySlot: "Empty slot",
    namePlaceholder: "Name",
    racePlaceholder: "Race",
    classPlaceholder: "Class",
    create: "Create",
    couldNotCreateCharacter: "Could not create character.",
    levelLabel: "Level",

    // Character Sheet
    hitPoints: "Hit Points",
    speed: "Speed",
    profBonus: "Prof. Bonus",
    armorClassLabel: "Armor Class",
    savingThrowProfs: "Saving Throw Proficiencies",
    skillProfs: "Skill Proficiencies",
    spells: "Spells",
    noSpellsKnown: "No spells known.",
    featuresTraits: "Features & Traits",
    noneRecorded: "None recorded.",
    notes: "Notes",
    saving: "saving…",
    temp: "temp",
    spellLevelAbbr: "Lv",
    abilityStrength: "STR",
    abilityDexterity: "DEX",
    abilityConstitution: "CON",
    abilityIntelligence: "INT",
    abilityWisdom: "WIS",
    abilityCharisma: "CHA",

    // Character sheet — tabs
    tabMain: "Main",
    tabPersonality: "Personality & Backstory",
    tabSpells: "Spellcasting",

    // Character sheet — header
    playerNameLabel: "Player Name",
    backgroundLabel: "Background",
    alignmentLabel: "Alignment",
    experiencePointsLabel: "Experience Points",
    inspirationLabel: "Inspiration",
    initiativeLabel: "Initiative",

    // Hit dice & death saves
    hitDiceLabel: "Hit Dice",
    deathSavesLabel: "Death Saves",
    successesLabel: "Successes",
    failuresLabel: "Failures",

    // Skills & saving throws
    skillsLabel: "Skills",
    savingThrowsLabel: "Saving Throws",
    passivePerceptionLabel: "Passive Wisdom (Perception)",
    proficientAbbr: "Prof",
    expertiseAbbr: "Exp",
    skillAcrobatics: "Acrobatics",
    skillArcana: "Arcana",
    skillAthletics: "Athletics",
    skillPerformance: "Performance",
    skillDeception: "Deception",
    skillStealth: "Stealth",
    skillHistory: "History",
    skillIntimidation: "Intimidation",
    skillInsight: "Insight",
    skillInvestigation: "Investigation",
    skillAnimalHandling: "Animal Handling",
    skillMedicine: "Medicine",
    skillNature: "Nature",
    skillPerception: "Perception",
    skillPersuasion: "Persuasion",
    skillSleightOfHand: "Sleight of Hand",
    skillReligion: "Religion",
    skillSurvival: "Survival",

    // Attacks & equipment
    attacksSpellsLabel: "Attacks & Spells",
    attackNamePlaceholder: "Name",
    attackBonusPlaceholder: "Bonus",
    attackDamagePlaceholder: "Damage / Type",
    addAttack: "+ Add attack",
    equipmentLabel: "Equipment",
    languagesProfsLabel: "Languages & Other Proficiencies",
    currencyCP: "CP",
    currencySP: "SP",
    currencyEP: "EP",
    currencyGP: "GP",
    currencyPP: "PP",

    // Personality & backstory
    personalityTraitsLabel: "Personality Traits",
    idealsLabel: "Ideals",
    bondsLabel: "Bonds",
    flawsLabel: "Flaws",
    ageLabel: "Age",
    heightLabel: "Height",
    weightLabel: "Weight",
    eyesLabel: "Eyes",
    skinLabel: "Skin",
    hairLabel: "Hair",
    appearanceLabel: "Character Appearance",
    alliesOrgsLabel: "Allies & Organizations",
    symbolLabel: "Symbol",
    backstoryLabel: "Character Backstory",
    additionalFeaturesLabel: "Additional Features & Traits",
    treasureLabel: "Treasure",

    // Spellcasting
    spellcastingClassLabel: "Spellcasting Class",
    spellcastingAbilityLabel: "Spellcasting Ability",
    spellSaveDCLabel: "Spell Save DC",
    spellAttackBonusLabel: "Spell Attack Bonus",
    cantripsLabel: "Cantrips",
    spellLevelLabel: "Level",
    slotsTotalLabel: "Slots Total",
    slotsUsedLabel: "Slots Used",
    addSpell: "+ Add spell",
    spellNamePlaceholder: "Spell name",
    preparedAbbr: "Prep.",

    // Classes (SRD)
    classBarbarian: "Barbarian",
    classBard: "Bard",
    classCleric: "Cleric",
    classDruid: "Druid",
    classFighter: "Fighter",
    classMonk: "Monk",
    classPaladin: "Paladin",
    classRanger: "Ranger",
    classRogue: "Rogue",
    classSorcerer: "Sorcerer",
    classWarlock: "Warlock",
    classWizard: "Wizard",

    // Races (SRD)
    raceHuman: "Human",
    raceDwarf: "Dwarf",
    raceElf: "Elf",
    raceHalfling: "Halfling",
    raceDragonborn: "Dragonborn",
    raceGnome: "Gnome",
    raceHalfElf: "Half-Elf",
    raceHalfOrc: "Half-Orc",
    raceTiefling: "Tiefling",

    // Multiclassing & automation
    multiclassLabel: "Classes (Multiclass)",
    addClass: "+ Add class",
    totalLevelLabel: "Total Level",
    selectClassPlaceholder: "Select class…",
    selectRacePlaceholder: "Select race…",
    otherInitiativeBonusLabel: "Other Initiative Bonus",
    autoFillHP: "Auto-fill from average",
    autoFillSlots: "Auto-fill spell slots",
    autoFillHint: "Fills in standard values you can still edit by hand.",

    // Inventory Sheet
    inventory: "Inventory",
    dmViewTag: "(DM view)",
    weightTotal: "total weight",
    colItem: "Item",
    colType: "Type",
    colQty: "Qty",
    colWeight: "Wt",
    colEquipped: "Equipped",
    noItemsYet: "No items yet.",
    remove: "remove",
    itemNamePlaceholder: "Item name",
    weapon: "Weapon",
    armor: "Armor",
    consumable: "Consumable",
    misc: "Misc",
    add: "Add",
    yes: "yes",
    no: "no",

    // DM page
    dmPanelSubtitle: "Quests, tables, and player oversight",

    // DM Quest Form
    submitQuest: "Submit a Quest",
    submitQuestHint: "New quests are sent to a master admin for approval before appearing on the Quest Board.",
    titlePlaceholder: "Title",
    descriptionPlaceholder: "Description",
    xpRewardLabel: "XP Reward",
    submittedAwaitingApproval: "Submitted — awaiting admin approval.",
    couldNotSubmitQuest: "Could not submit quest.",
    submitForApproval: "Submit for Approval",

    // DM Quest Queue
    mySubmittedQuests: "My Submitted Quests",
    noQuestsSubmittedYet: "You haven't submitted any quests yet.",
    statusPendingApproval: "Awaiting approval",
    statusApprovedAvailable: "Approved · Available",
    statusActiveLong: "Active",
    statusCompleted: "Completed",
    statusRejected: "Rejected",
    markActive: "Mark Active",
    markCompleted: "Mark Completed",

    // Table Organizer
    tableOrganization: "Table Organization",
    tableTitlePlaceholder: "Table / session title",
    createTable: "Create Table",
    endTable: "End Table",
    viewOnDiscord: "View on Discord",
    addPlayerPlaceholder: "Add player…",
    addToTable: "Add to Table",
    noTablesScheduled: "No tables scheduled yet.",

    // Item Forge
    itemForge: "Item Forge",
    itemForgeHint: "Design custom weapons, armor, and magic items, then hand them straight to a character's inventory.",
    flavorDescPlaceholder: "Flavor description",
    bonusPlaceholder: "Bonus (e.g. +1 to attack & damage)",
    weightPlaceholder: "Weight (lb)",
    effectPlaceholder: "Magical effect (e.g. deals an extra 1d6 fire damage on hit)",
    forgeItemBtn: "Forge Item",
    nothingForgedYet: "Nothing forged yet.",
    deleteBtn: "delete",
    grantToCharacter: "Grant to character…",
    grant: "Grant",
    granted: "Granted!",
    grantFailed: "Failed.",
    rarityCommon: "Common",
    rarityUncommon: "Uncommon",
    rarityRare: "Rare",
    rarityVeryRare: "Very Rare",
    rarityLegendary: "Legendary",
    rarityArtifact: "Artifact",

    // Player Character List
    playerCharacters: "Player Characters",
    playerCharactersHint: "Read-only. Open a character to check or add inventory items.",
    noCharactersCreatedYet: "No characters created yet.",

    // Quest Oversight (admin)
    questsByMaster: "Quests by Master",
    questsByMasterHint: "Adjust any quest's XP reward and approve or reject the ones pending.",
    votedLabel: "Voted",
    saveBtn: "Save",
    approveBtn: "Approve",
    rejectBtn: "Reject",
    noQuestsRegisteredYet: "No quests registered yet.",

    // DM Character View
    playerLabel: "Player",

    // Admin page
    masterAdmin: "Master Admin",
    masterAdminSubtitle: "Quest approvals, plus full DM and player panel access",
    dmPanelAccess: "DM Panel Access",

    // Back links
    backToDMPanel: "← Back to DM Panel",
  },
  pt: {
    // Barra lateral
    home: "Início",
    accountSettings: "Configurações da Conta",
    logout: "Sair",
    language: "Idioma",

    // Barra de XP
    worldLevel: "Nível do Mundo",

    // Cabeçalho do painel
    campaignDashboard: "Painel da campanha",
    dmPanel: "Painel do Mestre",
    adminPanel: "Painel do Admin",
    myCharacters: "Meus Personagens",
    dashboardLink: "Painel",

    // Login
    enterTheTavern: "Entrar na Taverna",
    email: "E-mail",
    password: "Senha",
    signIn: "Entrar",
    signInWithDiscord: "Entrar com Discord",
    discordOnlyNotice: "Contas são criadas e gerenciadas apenas pelo Discord.",
    invalidCredentials: "E-mail ou senha inválidos.",

    // Conta
    accountTitle: "Configurações da Conta",
    username: "Nome de usuário",
    usernameChatNotice: "Esse é o nome exibido no Chat da Mesa, no site e no Discord.",
    saveChanges: "Salvar Alterações",
    changePassword: "Alterar Senha",
    currentPassword: "Senha Atual",
    newPassword: "Nova Senha",
    updatePassword: "Atualizar Senha",
    savedSuccessfully: "Salvo com sucesso.",
    role: "Papel",

    // Quadro de Missões
    questBoard: "Quadro de Missões",
    questBoardHint: "Mostra apenas missões de Mestres que têm uma próxima sessão marcada.",
    noQuestsAvailable: "Nenhuma missão disponível no momento — volte quando um Mestre marcar uma sessão.",
    masterLabel: "Mestre",
    statusAvailable: "Disponível",
    statusActive: "Em andamento",
    vote: "Votar",
    voted: "Votou",

    // Quadro de Avisos
    dmNoticeBoard: "Quadro de Avisos do Mestre",
    noAnnouncementsYet: "Nenhum aviso por enquanto.",
    pinned: "FIXADO",

    // Próximas Sessões
    upcomingSessions: "Próximas Sessões",
    nothingScheduled: "Nada agendado ainda.",
    confirmed: "Confirmados",
    joinedWith: "Você entrou com",
    leave: "Sair",
    createCharacterToJoin: "Crie um personagem para poder ingressar.",
    chooseCharacter: "Escolher personagem…",
    join: "Ingressar",

    // Registro de Missões
    missionLog: "Registro de Missões",
    noCompletedQuests: "Nenhuma missão concluída ainda.",

    // Chat
    partyChat: "Chat da Party",
    syncedWithDiscord: "sincronizado com o Discord",
    messageThePlaceholder: "Mensagem para a party…",
    loginToChat: "Entre para conversar",
    send: "Enviar",

    // Personagens
    yourCharacters: "Seus Personagens",
    slotsUsed: "vagas usadas",
    newCharacter: "+ Novo Personagem",
    emptySlot: "Vaga vazia",
    namePlaceholder: "Nome",
    racePlaceholder: "Raça",
    classPlaceholder: "Classe",
    create: "Criar",
    couldNotCreateCharacter: "Não foi possível criar o personagem.",
    levelLabel: "Nível",

    // Ficha do Personagem
    hitPoints: "Pontos de Vida",
    speed: "Deslocamento",
    profBonus: "Bônus de Proficiência",
    armorClassLabel: "Classe de Armadura",
    savingThrowProfs: "Proficiências em Testes de Resistência",
    skillProfs: "Proficiências em Perícias",
    spells: "Magias",
    noSpellsKnown: "Nenhuma magia conhecida.",
    featuresTraits: "Características e Traços",
    noneRecorded: "Nenhuma registrada.",
    notes: "Anotações",
    saving: "salvando…",
    temp: "temp",
    spellLevelAbbr: "Nv",
    abilityStrength: "FOR",
    abilityDexterity: "DES",
    abilityConstitution: "CON",
    abilityIntelligence: "INT",
    abilityWisdom: "SAB",
    abilityCharisma: "CAR",

    // Ficha — abas
    tabMain: "Principal",
    tabPersonality: "Personalidade e História",
    tabSpells: "Magias",

    // Ficha — cabeçalho
    playerNameLabel: "Nome do Jogador",
    backgroundLabel: "Antecedente",
    alignmentLabel: "Tendência",
    experiencePointsLabel: "Pontos de Experiência",
    inspirationLabel: "Inspiração",
    initiativeLabel: "Iniciativa",

    // Dados de vida e testes contra a morte
    hitDiceLabel: "Dados de Vida",
    deathSavesLabel: "Testes Contra a Morte",
    successesLabel: "Sucessos",
    failuresLabel: "Fracassos",

    // Perícias e testes de resistência
    skillsLabel: "Perícias",
    savingThrowsLabel: "Testes de Resistência",
    passivePerceptionLabel: "Sabedoria Passiva (Percepção)",
    proficientAbbr: "Prof",
    expertiseAbbr: "Esp",
    skillAcrobatics: "Acrobacia",
    skillArcana: "Arcanismo",
    skillAthletics: "Atletismo",
    skillPerformance: "Atuação",
    skillDeception: "Blefar",
    skillStealth: "Furtividade",
    skillHistory: "História",
    skillIntimidation: "Intimidação",
    skillInsight: "Intuição",
    skillInvestigation: "Investigação",
    skillAnimalHandling: "Lidar com Animais",
    skillMedicine: "Medicina",
    skillNature: "Natureza",
    skillPerception: "Percepção",
    skillPersuasion: "Persuasão",
    skillSleightOfHand: "Prestidigitação",
    skillReligion: "Religião",
    skillSurvival: "Sobrevivência",

    // Ataques e equipamento
    attacksSpellsLabel: "Ataques e Magias",
    attackNamePlaceholder: "Nome",
    attackBonusPlaceholder: "Bônus",
    attackDamagePlaceholder: "Dano / Tipo",
    addAttack: "+ Adicionar ataque",
    equipmentLabel: "Equipamento",
    languagesProfsLabel: "Idiomas e Outras Proficiências",
    currencyCP: "PC",
    currencySP: "PP",
    currencyEP: "PE",
    currencyGP: "PO",
    currencyPP: "PL",

    // Personalidade e história
    personalityTraitsLabel: "Traços de Personalidade",
    idealsLabel: "Ideais",
    bondsLabel: "Ligações",
    flawsLabel: "Defeitos",
    ageLabel: "Idade",
    heightLabel: "Altura",
    weightLabel: "Peso",
    eyesLabel: "Olhos",
    skinLabel: "Pele",
    hairLabel: "Cabelos",
    appearanceLabel: "Aparência do Personagem",
    alliesOrgsLabel: "Aliados e Organizações",
    symbolLabel: "Símbolo",
    backstoryLabel: "História do Personagem",
    additionalFeaturesLabel: "Outras Características e Habilidades",
    treasureLabel: "Tesouro",

    // Conjuração
    spellcastingClassLabel: "Classe de Conjurador",
    spellcastingAbilityLabel: "Habilidade Chave",
    spellSaveDCLabel: "CD do TR",
    spellAttackBonusLabel: "Bônus de Ataque",
    cantripsLabel: "Truques",
    spellLevelLabel: "Nível",
    slotsTotalLabel: "Espaços Total",
    slotsUsedLabel: "Espaços Usados",
    addSpell: "+ Adicionar magia",
    spellNamePlaceholder: "Nome da magia",
    preparedAbbr: "Prep.",

    // Classes (SRD)
    classBarbarian: "Bárbaro",
    classBard: "Bardo",
    classCleric: "Clérigo",
    classDruid: "Druida",
    classFighter: "Guerreiro",
    classMonk: "Monge",
    classPaladin: "Paladino",
    classRanger: "Patrulheiro",
    classRogue: "Ladino",
    classSorcerer: "Feiticeiro",
    classWarlock: "Bruxo",
    classWizard: "Mago",

    // Raças (SRD)
    raceHuman: "Humano",
    raceDwarf: "Anão",
    raceElf: "Elfo",
    raceHalfling: "Halfling",
    raceDragonborn: "Draconato",
    raceGnome: "Gnomo",
    raceHalfElf: "Meio-Elfo",
    raceHalfOrc: "Meio-Orc",
    raceTiefling: "Tiefling",

    // Multiclasse e automação
    multiclassLabel: "Classes (Multiclasse)",
    addClass: "+ Adicionar classe",
    totalLevelLabel: "Nível Total",
    selectClassPlaceholder: "Selecionar classe…",
    selectRacePlaceholder: "Selecionar raça…",
    otherInitiativeBonusLabel: "Bônus Adicional de Iniciativa",
    autoFillHP: "Preencher pela média",
    autoFillSlots: "Preencher espaços de magia",
    autoFillHint: "Preenche valores padrão que você ainda pode editar manualmente.",

    // Inventário
    inventory: "Inventário",
    dmViewTag: "(visão do Mestre)",
    weightTotal: "peso total",
    colItem: "Item",
    colType: "Tipo",
    colQty: "Qtd",
    colWeight: "Peso",
    colEquipped: "Equipado",
    noItemsYet: "Nenhum item ainda.",
    remove: "remover",
    itemNamePlaceholder: "Nome do item",
    weapon: "Arma",
    armor: "Armadura",
    consumable: "Consumível",
    misc: "Diversos",
    add: "Adicionar",
    yes: "sim",
    no: "não",

    // Painel do Mestre
    dmPanelSubtitle: "Missões, mesas e supervisão de jogadores",

    // Formulário de Missão
    submitQuest: "Enviar uma Missão",
    submitQuestHint: "Novas missões são enviadas a um admin mestre para aprovação antes de aparecerem no Quadro de Missões.",
    titlePlaceholder: "Título",
    descriptionPlaceholder: "Descrição",
    xpRewardLabel: "Recompensa em XP",
    submittedAwaitingApproval: "Enviada — aguardando aprovação do admin.",
    couldNotSubmitQuest: "Não foi possível enviar a missão.",
    submitForApproval: "Enviar para Aprovação",

    // Fila de Missões do Mestre
    mySubmittedQuests: "Minhas Missões Enviadas",
    noQuestsSubmittedYet: "Você ainda não enviou nenhuma missão.",
    statusPendingApproval: "Aguardando aprovação",
    statusApprovedAvailable: "Aprovada · Disponível",
    statusActiveLong: "Ativa",
    statusCompleted: "Concluída",
    statusRejected: "Rejeitada",
    markActive: "Marcar como Ativa",
    markCompleted: "Marcar como Concluída",

    // Organização das Mesas
    tableOrganization: "Organização das Mesas",
    tableTitlePlaceholder: "Título da mesa / sessão",
    createTable: "Criar Mesa",
    endTable: "Encerrar Mesa",
    viewOnDiscord: "Ver no Discord",
    addPlayerPlaceholder: "Adicionar jogador…",
    addToTable: "Adicionar à Mesa",
    noTablesScheduled: "Nenhuma mesa agendada ainda.",

    // Forja de Itens
    itemForge: "Forja de Itens",
    itemForgeHint: "Crie armas, armaduras e itens mágicos personalizados, e entregue-os direto no inventário de um personagem.",
    flavorDescPlaceholder: "Descrição narrativa",
    bonusPlaceholder: "Bônus (ex: +1 no ataque e dano)",
    weightPlaceholder: "Peso (lb)",
    effectPlaceholder: "Efeito mágico (ex: causa 1d6 de dano de fogo adicional ao acertar)",
    forgeItemBtn: "Forjar Item",
    nothingForgedYet: "Nada forjado ainda.",
    deleteBtn: "excluir",
    grantToCharacter: "Conceder a um personagem…",
    grant: "Conceder",
    granted: "Concedido!",
    grantFailed: "Falhou.",
    rarityCommon: "Comum",
    rarityUncommon: "Incomum",
    rarityRare: "Raro",
    rarityVeryRare: "Muito Raro",
    rarityLegendary: "Lendário",
    rarityArtifact: "Artefato",

    // Lista de Personagens dos Jogadores
    playerCharacters: "Personagens dos Jogadores",
    playerCharactersHint: "Somente leitura. Abra um personagem para conferir ou adicionar itens ao inventário.",
    noCharactersCreatedYet: "Nenhum personagem criado ainda.",

    // Supervisão de Missões (admin)
    questsByMaster: "Missões por Mestre",
    questsByMasterHint: "Ajuste a recompensa em XP de qualquer missão e aprove ou rejeite as que estão pendentes.",
    votedLabel: "Votaram",
    saveBtn: "Salvar",
    approveBtn: "Aprovar",
    rejectBtn: "Rejeitar",
    noQuestsRegisteredYet: "Nenhuma missão cadastrada ainda.",

    // Visão do Mestre sobre um Personagem
    playerLabel: "Jogador",

    // Painel do Admin
    masterAdmin: "Admin Mestre",
    masterAdminSubtitle: "Aprovações de missões, além de acesso completo aos painéis de Mestre e jogadores",
    dmPanelAccess: "Acesso ao Painel do Mestre",

    // Links de voltar
    backToDMPanel: "← Voltar ao Painel do Mestre",
  },
};
