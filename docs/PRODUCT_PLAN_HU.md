# CalicoChef – személyes étrendtervező

> Állapot: aktív fejlesztési alap  
> Termékirány: személyre szabható heti étrend, receptek, kalória- és makrótápanyag-követés.  
> Első cél: a jelenlegi React + TypeScript + Supabase alkalmazás továbbfejlesztése, nem az újraírása.

## 1. Termékvízió

A CalicoChef segít előre megtervezni az étkezéseket, recepteket rendszerezni, és átlátni a tervezett napi energiabevitelt, valamint a fehérje-, szénhidrát- és zsírbevitelt. A felület legyen barátságos, mobilon is kényelmes, és ne szégyenítse meg a felhasználót, ha eltér a kitűzött céltól.

Az alkalmazás nem diagnosztikai eszköz, és nem helyettesíti az orvosi vagy dietetikusi tanácsadást. A kalória- és tápértékadatok becslések lehetnek; az allergének és összetevők ellenőrzése a felhasználó felelőssége.

## 2. Meglévő technikai alap

- Frontend: React 19, TypeScript, TanStack Start/Router és Tailwind CSS.
- Adatok és hitelesítés: Supabase.
- Lekérdezések és cache: TanStack Query.
- Receptadatok: adag, kcal, fehérje, szénhidrát, zsír, hozzávalók és elkészítési lépések.
- Étkezéstervező: heti napokra bontott étkezési helyek és adagok.
- Napi napló: szöveges bejegyzés, éhségérzet, hangulat és aktivitás/energia önértékelése.

A meglévő komponenseket és adatbázissémát fokozatosan kell fejleszteni, kis, ellenőrizhető módosításokkal.

## 3. MVP – elsődleges funkciók

### A. Napi és heti étrend
- Heti napok közötti navigáció.
- Étkezési helyek és receptek hozzárendelése.
- Adagszám módosítása, étkezésenkénti kalóriabecslés.
- Napi összesített kalóriabevitel és a személyes célhoz viszonyított áttekintés.
- Makrótápanyagok napi összesítése.
- Üres, betöltési, mentési és hibaállapotok egyértelmű jelzése.

### B. Receptgyűjtemény
- Saját recept létrehozása, szerkesztése és törlése.
- Hozzávalók mennyiséggel és mértékegységgel.
- Adagszám és tápértékadatok.
- Elkészítési lépések és opcionális borítókép.
- Külső receptkeresés egyértelmű forrásmegjelöléssel.

### C. Bevásárlólista
- A megtervezett ételek hozzávalóinak összesítése.
- Azonos nevű és mértékegységű tételek összevonása.
- Tételek kipipálása és nyomtatható lista.
- Következő fejlesztési körben a lista tartós mentése, kézi tételek és készletkezelés.

### D. Személyes profil és célok
- Napi kalóriacél kézi beállítása.
- Opcionális életkor-, magasság-, testsúly- és számításhoz használt nem mezők.
- Aktivitási szint és cél (fogyás, súlytartás, súlygyarapítás) kiválasztása.
- Átlátható, Mifflin–St Jeor alapú becslés; a becsült célt a felhasználó módosíthatja mentés előtt.
- Opcionális fehérje-, szénhidrát- és zsírcélok.
- A profiladatok új, visszafelé kompatibilis adatbázismezőkbe kerülnek.
- A rendszer ne adjon szélsőséges vagy egészségügyileg kockázatos fogyási tanácsot.
- Külső aktivitásintegráció csak tényleges működés esetén jelenjen meg csatlakoztatottként.

### E. Napi napló
- Rövid napi jegyzet.
- Éhségérzet, hangulat és energiaszint/aktivitás rögzítése.
- Semleges, támogató nyelvezet; a cél túllépése ne legyen büntetésként megjelenítve.

## 4. Későbbi fejlesztések

- A beállított fehérje-, szénhidrát- és zsírcélok napi haladásának megjelenítése.
- Többnapos étrendjavaslat a felhasználó preferenciái és kizárásai alapján.
- Étkezési preferenciák és allergének kezelése, figyelmeztetésekkel.
- Havi áttekintő és trendek.
- Bevásárlólista kézi tételekkel és korábbi listák megőrzésével.
- Receptcímkék, kedvencek, szűrők és saját étkezéssablonok.
- Export és nyomtatható heti terv.
- Opcionális, ingyenes vagy saját kulccsal használható AI-segítség; az alapfunkciók AI nélkül is működjenek.

## 5. Vizuális irány

- Barátságos, meleg és modern megjelenés.
- Mobilközpontú, könnyen kezelhető kártyák és alsó navigáció.
- Magyar nyelvű feliratok, dátumok és mértékegységek.
- Jó kontraszt, billentyűzettel használható vezérlők és egyértelmű fókuszállapotok.
- A cica-karakter maradhat visszafogott márkaelem, de a tápérték és az étkezési terv legyen az elsődleges információ.

## 6. Adatbiztonság

- Titkos kulcs nem kerülhet a kliensoldali kódba vagy a Git-tárolóba.
- A `.env` fájlok maradjanak a Git által figyelmen kívül hagyva; csak helyi konfigurációra használjuk őket.
- Supabase RLS és felhasználóhoz kötött jogosultságok ellenőrzése.
- A felhasználó csak a saját profilját, receptjeit és naplóját olvashassa/módosíthassa.
- A törlés és a külső integrációk státusza legyen egyértelmű.
- Érzékeny adatot és kulcsot soha ne írjunk naplóba vagy hibajelentésbe.

## 7. Fejlesztési sorrend

1. Meglévő komponensek és adatbázis-séma áttekintése.
2. Magyar nyelvű alkalmazáskeret és navigáció.
3. Napi kalória- és makróösszesítés.
4. Recept- és étrendtervező felület finomítása.
5. Bevásárlólista mentésének és állapotainak megbízhatóvá tétele.
6. Profil és célbeállítások (alapmezők és kalóriabecslés elkészült; mentés és adatbázis-migráció ellenőrzése szükséges).
7. Mobilos, jogosultsági és hibakezelési ellenőrzések.
8. Build/lint ellenőrzés és az esetleges hibák javítása.
9. Csak ezután új, nagyobb funkciók bevezetése.

## 8. Elfogadási kritériumok az első fejlesztési körhöz

- A fő navigáció és a főképernyő magyarul jelenik meg.
- A kiválasztott nap étkezéseihez tartozó kcal és makrók az adagokkal arányosan számolódnak.
- A napi kalóriaösszeg a recept adagszámának változásakor frissül.
- A recept-, étrend- és bevásárlólista-funkciók továbbra is a meglévő Supabase-adatokkal dolgoznak.
- Nem jelenik meg sikeresnek látszó, de valójában nem működő külső szinkronizálás.
- A felület telefonon is használható marad.
