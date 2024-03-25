## Inicjalizacja

```bash
# instalacja pakietów nodejs
npm install

# ustawiamy zmienne środowiskowe w pliku .env
DATABASE_URL="file:./dev.db"

# migracja bazy danych (tworzy bazę danych na podstawie schema.prisma)
npx prisma migrate dev --name init

```

## Uruchomienie

```bash
# uruchomienie projektu
npm run dev -- --host

# uruchomienie konsoli bazy danych
npx prisma studio
```

## Budowanie

```bash
npm run build
```
