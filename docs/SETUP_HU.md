# CalicoChef – helyi indítás és adatbázis-beállítás

## 1. Környezeti változók

1. Másold az `.env.example` fájlt `.env` néven.
2. A saját Supabase projektedből töltsd ki a `SUPABASE_URL`, `SUPABASE_PROJECT_ID` és `SUPABASE_PUBLISHABLE_KEY` / `VITE_*` változókat.
3. A `.env` helyi fájl; ne töltsd fel GitHubra. A repository `.gitignore` fájlja kizárja a helyi környezeti fájlokat.
4. Kizárólag a böngészőben használható publishable/anon kulcs kerüljön `VITE_*` változóba. Supabase service-role kulcsot vagy más titkot soha ne tegyél frontend környezeti változóba.

## 2. Supabase-adatbázis frissítése

Az étrendcélok új profilmezőket használnak, ezért a migrációt alkalmazni kell, mielőtt az új verziót a meglévő adatbázissal használod.

1. Nyisd meg a megfelelő projektet a Supabase Dashboardban.
2. Nyisd meg az SQL Editor felületet.
3. A repositoryból nyisd meg ezt a fájlt, és másold be a teljes SQL-t:
   `supabase/migrations/20261014140000_add_personal_diet_goals.sql`
4. Futtasd le a lekérdezést, és ellenőrizd, hogy hiba nélkül befejeződött.
5. A `public.profiles` táblában ellenőrizd, hogy megjelentek az új mezők: `age_years`, `height_cm`, `weight_kg`, `sex`, `activity_level`, `goal_type`, `target_protein_g`, `target_carbs_g`, `target_fat_g`.

A migráció meglévő profiladatokat nem töröl; új oszlopokat és validációs korlátozásokat ad hozzá. A korlátozások ellenőrzése miatt a migráció biztonságosabban újrafuttatható. Az alkalmazás kódja nem fér hozzá automatikusan a te Supabase Dashboardodhoz, ezért ez a lépés külön végrehajtást igényel.

## 3. Helyi futtatás

Bun használatával:

```sh
bun install --frozen-lockfile
bun run dev
```

A production build ellenőrzése:

```sh
bun run build
bunx eslint . --rule 'prettier/prettier: off'
```

A repository jelenlegi formázási állapota miatt a teljes `bun run lint` Prettier-formázási hibákat is jelez. Ezeket külön, átnézve érdemes javítani; a `bun run format` az egész repositoryt átírná.

## 4. Ellenőrzési lista kiadás előtt

- [ ] A Supabase-migráció sikeresen lefutott a megfelelő projekten.
- [ ] Az auth: regisztráció, bejelentkezés és kijelentkezés működik.
- [ ] Profiladatok és napi célok mentése, majd újratöltés utáni visszaolvasása működik.
- [ ] Recept létrehozása, szerkesztése és törlése működik.
- [ ] Heti étkezéstervezés és adagváltoztatás működik.
- [ ] Napi kalória- és makróösszesítések valós adatokkal ellenőrizve.
- [ ] Mobilnézet, üres állapotok és hibaüzenetek ellenőrizve.
- [ ] A GitHub Actions build és ESLint-ellenőrzése sikeres.

A kalóriaértékek becslések, nem orvosi vagy dietetikusi tanácsok.
