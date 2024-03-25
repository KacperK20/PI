export enum action_type {
    DELETE,
    ADD,
    TAKEIN,
    GIVEOUT,
    MOVE,
    RECEIVE,
    UPDATE,
    SPLIT,
    MERGE
}

export const action_type_lang = [
    'Usunięto przedmiot',
    'Dodano przedmiot',
    'Przyjęto przedmiot',
    'Wydano przedmiot',
    'Przeniesiono przedmiot',
    'Otrzymano przedmiot',
    'Zaktualizowano przedmiot'
];

export const action_type_color = [
    'bg-red-300',
    'bg-green-300',
    'bg-blue-300',
    'bg-yellow-300',
    'bg-orange-300',
    'bg-purple-300',
    'bg-cyan-300'
];
