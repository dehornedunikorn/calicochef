# Háztartási étkezéstervező – termék- és fejlesztési terv

> Munkanév: **CalicoChef** (a projekt elnevezése később módosítható)  
> Állapot: tervezési alapdokumentum  
> Fő cél: a háztartás étkezéseinek közös, előre tervezhető megszervezése – nem fitness- vagy kalóriaszámláló alkalmazás.

## 1. Termékvízió

A CalicoChef egy közös háztartási étkezéstervező. A háztartás tagjai egy közös naptárban tervezik meg a heti és havi étkezéseket, recepteket rendelnek hozzájuk, kezelik a személyenkénti adagokat és alternatívákat, majd a rendszer ezekből automatikusan összeállítja a bevásárlólistát.

### Alapelvek
- A háztartás az elsődleges szervezési egység.
- Több felhasználó egyszerre szerkesztheti a közös menüt, valós idejű szinkronizálással.
- Egy étkezésen belül közös főétel és személyenkénti alternatívák is megadhatók.
- A heti és havi nézet ugyanazt az adatforrást használja.
- A bevásárlólista a menüből és az otthoni készletből számolódik, de a manuális tételeket is megőrzi.
- A kalória- és makrószámítás opcionális; nem ez a fő felhasználói élmény.
- Az allergiák és az étkezési preferenciák külön kezelendők.

## 2. Célfelhasználók és jogosultságok

Egy felhasználó több háztartás tagja is lehet.

| Szerep | Jogosultság |
|---|---|
| Háztartásgazda | Háztartásbeállítások, meghívók, tagok és jogosultságok kezelése; teljes szerkesztés |
| Szerkesztő | Menü, receptek, készlet és bevásárlólista módosítása |
| Tag | Menü megtekintése, saját profil és étkezési jelenlét kezelése; a háztartás beállításai szerint szerkesztés |
| Megtekintő | Olvasási hozzáférés |

A felhasználói szerepkör külön fogalom a személyes étkezési profiltól.

## 3. Funkcionális terjedelem

### P0 – MVP, az első használható kiadás

1. **Háztartások és fiókok**
   - Regisztráció és bejelentkezés.
   - Háztartás létrehozása és meghívólink.
   - Tagok és szerepkörök kezelése.
   - Több háztartás közötti váltás előkészítése.

2. **Heti és havi menütervező**
   - Hét/hónap navigáció és aktuális dátumra ugrás.
   - Reggeli, tízórai, ebéd, uzsonna, vacsora és egyéni étkezéstípusok.
   - Étkezés létrehozása, szerkesztése, másolása, áthelyezése és törlése.
   - Recept vagy gyorsan felvett étel hozzárendelése.
   - Heti terv másolása egy másik hétre.

3. **Rugalmas étkezési hozzárendelések**
   - Étkezési alkalom, étel és személyes hozzárendelés külön adatmodellben.
   - Több étel egy étkezési alkalomhoz.
   - Résztvevők, személyenkénti adagok és alternatívák.
   - Étkezési jelenlét napok/étkezések szerint.

4. **Receptek**
   - Saját receptek létrehozása és szerkesztése.
   - Hozzávalók, mennyiségek, mértékegységek, elkészítési lépések és adagszám.
   - Keresés, címkék és kedvencek.
   - Receptverzió vagy pillanatkép az étkezéshez, hogy a későbbi receptmódosítás ne írja át észrevétlenül a már megtervezett menüt.

5. **Közös bevásárlólista**
   - Menü hozzávalóinak összesítése.
   - Azonos alapanyagok mennyiségeinek összevonása.
   - Manuális tételek hozzáadása.
   - Kategóriák, kipipálás, vásárlási állapot.
   - A manuális és már megvásárolt tételek megőrzése újrageneráláskor.

6. **Valós idejű együttműködés**
   - Adatváltozások élő megjelenítése más tagoknál.
   - Mentési/szinkronizálási állapot kijelzése.
   - Verzióellenőrzés és ütközéskezelés.
   - Hibás mentéskor újrapróbálás, adatvesztés nélküli visszajelzés.

7. **Biztonság és használhatóság**
   - Háztartásonkénti adatelkülönítés.
   - Szerveroldali jogosultság-ellenőrzés és adatbázis-RLS.
   - Reszponzív, mobilon is kényelmes felület.
   - Betöltési, üres, hiba- és offline/szinkronizálási állapotok.

### P1 – következő kiadás
- Otthoni készlet: mennyiség, egység, tárolási hely és opcionális lejárat.
- Maradékok és felhasználhatósági dátum.
- Készlet levonása a bevásárlási szükségletből, duplázás nélkül.
- Heti menüsablonok és korábbi hetek újrafelhasználása.
- Receptképek és külső receptimport, a forrás licencének figyelembevételével.
- Opcionális becsült költség és tápérték.

### P2 – későbbi fejlesztések
- AI-alapú heti menüjavaslatok.
- Költségkerethez és otthoni készlethez igazított ajánlások.
- Ár-összehasonlítás és bolti integráció, ha megfelelő adatforrás elérhető.
- PWA telepíthetőség és továbbfejlesztett offline működés.
- Export, nyomtatható heti terv és bevásárlólista.

## 4. Képernyőterv

### Fő navigáció
1. **Menütervező** – heti/havi naptár, napok, étkezések, résztvevők.
2. **Receptek** – keresés, szűrők, kedvencek, receptszerkesztő.
3. **Bevásárlólista** – összesített és manuális tételek, kipipálás.
4. **Készlet és maradékok** – P1.
5. **Háztartás** – tagok, meghívók, szerepkörök, profilok és beállítások.

### Fő munkafolyamat
Hét kiválasztása → ételek/receptek hozzáadása → résztvevők és adagok beállítása → hozzávalók összesítése → készlet figyelembevétele → közös bevásárlólista.

### Heti menütervező
- Asztali nézet: hét oszlopai és étkezési kártyák.
- Mobilnézet: napválasztó és az adott nap étkezései.
- Étkezésenként látható név, adagok, résztvevők és alternatívák.
- Gyors műveletek: hozzáadás, szerkesztés, másolás, áthelyezés.
- Valós idejű frissítés és egyértelmű mentési állapot.

### Étkezésszerkesztő
- Dátum és étkezéstípus.
- Recept vagy szabad szöveges étel.
- Hozzárendelt ételek és személyek.
- Adagok és alternatívák.
- Megjegyzések.
- Hozzávalóigény előnézete.

## 5. Javasolt technikai architektúra

A meglévő repó technológiáihoz igazodva a javasolt irány:
- **Frontend:** React + TypeScript, reszponzív komponensekkel.
- **Adatbázis és backend:** Supabase / PostgreSQL.
- **Hitelesítés:** Supabase Auth.
- **Valós idejű szinkron:** Supabase Realtime, jogosultságokkal korlátozott csatornákkal.
- **Biztonság:** Row Level Security (RLS), szerveroldali ellenőrzések.
- **Telepítés:** a meglévő projekt beállításaihoz illeszkedő hosting; a pontos konfigurációt a repó auditja után kell véglegesíteni.

Az ingyenes csomagok aktuális korlátait indulás előtt ellenőrizni kell; a rendszer ne függjön kötelezően fizetős AI-szolgáltatástól.

### Logikai architektúra
Böngésző → hitelesítés és adat API → jogosultság/RLS → PostgreSQL → valós idejű események → többi aktív kliens.

A kliensoldali felületi elrejtés önmagában nem jogosultságvédelem. Minden adatmódosítást a backendnek/adatbázisnak is engedélyeznie kell.

## 6. Kezdeti adatmodell

| Entitás | Felelősség |
|---|---|
| households | Háztartás és beállítások |
| household_members | Felhasználó, háztartás és szerepkör kapcsolata |
| member_profiles | Preferenciák, allergiák, adagok és célok |
| meal_slots | Dátumhoz és étkezéstípushoz tartozó alkalom |
| meal_items | Az alkalomhoz tartozó ételek/receptek |
| meal_assignments | Személy, étel és adag hozzárendelése |
| recipes | Recept és verzió |
| recipe_ingredients | Receptösszetevők, mennyiség és egység |
| ingredients | Normalizált alapanyagjegyzék |
| shopping_lists | Háztartási bevásárlólisták |
| shopping_items | Automatikus vagy manuális tételek és státusz |
| pantry_items | P1: otthoni készlet |
| leftovers | P1: maradékok |
| activity_log | Fontos változások auditja |

Minden háztartási adatnak egyértelmű háztartáskapcsolattal kell rendelkeznie. Az alapanyagoknál a név mellett normalizált egységet és mennyiséget is tárolni kell. g, kg, ml és l között lehet szabályos átváltás; darab és tömeg között csak alapanyagspecifikus szabály alapján.

## 7. Valós idejű szerkesztés és konzisztencia

- A kliens csak a szerver által megerősített mentést jelezze véglegesnek.
- A rekordok használjanak updated_at és/vagy verziómezőt.
- Különböző mezők párhuzamos módosítását meg kell őrizni.
- Azonos mező konfliktusakor verzióellenőrzés és felhasználói visszajelzés szükséges.
- A törlés és egyidejű szerkesztés konfliktusa legyen látható.
- A bevásárlólista automatikus tételei újraszámíthatók legyenek, a manuális és már megvásárolt tételek ne vesszenek el.
- A tervezett készletfelhasználást külön kell kezelni a tényleges felhasználástól.

## 8. Biztonsági és adatvédelmi követelmények

- RLS minden háztartási adattáblán.
- Tagság-ellenőrzés minden olvasásnál és írásnál.
- Meghívólinkek lejárata és visszavonhatósága.
- Privát profiladatok ne kerüljenek nyilvános recept- vagy háztartási lekérdezésekbe.
- Titkos kulcs csak szerveroldalon szerepelhet.
- Adat-export és törlési folyamat megtervezése.
- Allergia külön kezelendő a preferenciától; a felület ne állítsa, hogy automatikusan garantálja az étel allergénmentességét.

## 9. Elfogadási kritériumok az MVP-hez

- Két külön felhasználó ugyanahhoz a háztartáshoz tud csatlakozni.
- Egy menümódosítás másik bejelentkezett kliensben is megjelenik.
- Heti és havi nézet ugyanazokat az adatokat mutatja.
- Egy étkezéshez több étel és személyenkénti adag rendelhető.
- Recept-hozzávalókból összevont bevásárlólista készül.
- A manuális és megvásárolt tételek megmaradnak újraszámításkor.
- Más háztartás adatai jogosulatlanul nem olvashatók és nem módosíthatók.
- Sikertelen mentéskor a felhasználó értesül a hibáról, és a módosítás nem vész el csendben.
- A fő feladatok mobilnézetben is elvégezhetők.

## 10. Fejlesztési sorrend

1. A meglévő repó és adatbázis-migrációk auditja; a terv összehangolása a már létező kóddal.
2. Képernyővázlat és interaktív heti menütervező.
3. Háztartás, tagság, jogosultságok és RLS.
4. Menünaptár, ételek, hozzárendelések és valós idejű frissítés.
5. Receptek és hozzávalók.
6. Bevásárlólista és menüből számolt igény.
7. Párhuzamos szerkesztési, jogosultsági és mobiltesztek.
8. Kiadás; ezt követően készlet, maradékok és további automatizmusok.

## 11. Nyitott döntések

- Végleges terméknév és vizuális arculat.
- A hét kezdőnapja és alapértelmezett étkezéstípusok.
- A háztartási tagok alapértelmezett szerkesztési jogosultsága.
- Mennyire részletes legyen az offline működés az első kiadásban.
- Receptadatok kézi bevitele vagy külső adatforrás az MVP-ben.
- A készletkezelés MVP-be kerüljön-e, vagy maradjon P1.

## 12. Következő konkrét lépés

A terv első lépése ne az egész alkalmazás egyszerre történő átírása legyen. Először vizsgáljuk át a jelenlegi projekt képernyőit, adatbázisát és Supabase-szabályait, majd egy külön, jól tesztelhető munkaszakaszban valósítsuk meg a heti menütervező első verzióját.

**Első fejlesztési feladat:** heti naptár + étkezésszerkesztő + háztartási adatok biztonságos betöltése, meglévő funkciók regressziója nélkül.
