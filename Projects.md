# AutoDigits Proje Yapısı (Genel Bakış)

Bu belge AutoDigits projesinin tüm ana modüllerini ve çalışma adımlarını Türkçe olarak açıklar. Amaç: ekibe hızlı onboarding, mimari kavrama ve yerel geliştirmenin adım adım nasıl yapılacağını belirtmek.

## 1. Repo Genel Yapısı

Kök dizin şu ana iki bölümden oluşur:

- `autodigits-backend/`: Java Spring Boot monorepo backend.
- `autodigits-frontend/`: React + Vite + TypeScript ön yüz.

Her iki taraf da dallı/katmanlı tasarım kullanır.

---

## 2. Backend (autodigits-backend)

### 2.1 Ana modül (pom.xml)

`autodigits-backend/pom.xml`:
- Çoklu Maven modüllerini içerir (module listesi).
- Java 21, Spring Boot 3.5.10, AWS SDK, MapStruct, Lombok, PostgreSQL vb. sürümlerini tanımlar.

### 2.2 Modüller

Her modül, tek sorumluluk (domain bounded context) odaklıdır:

- `autodigits-app-boot/`: Spring Boot uygulamasının başlatma modülü (API, güvenlik, bağımlılıklar).
- `autodigits-platform/`: paylaşılan altyapı, ortak kod, persistence, event, util.
- `autodigits-storage/`: S3 / LocalStack dosya yükleme/indirme.
- `autodigits-iam/`: kullanıcı, rol, izin yönetimi.
- `autodigits-tenant/`: tenant/şirket yönetimi, multitenancy.
- `autodigits-license/`: lisans yönetimi.
- `autodigits-vehicle/`: araç verisi, araç yönetimi.
- `autodigits-document/`: doküman yönetimi.
- `autodigits-calendar/`: takvim etkinlikleri.
- `autodigits-task/`: görev yönetimi.
- `autodigits-crm/`: müşteri ilişkileri.

### 2.3 Konfigürasyon (profiles)

`autodigits-app-boot/src/main/resources`:
- `application.yml`: ortak konfig.
- `application-local.yml`: yerel, docker compose ile uyumlu (Postgres, Keycloak, LocalStack, OpenSearch).
- `application-dev.yml`/`application-prod.yml`: ortam bazlı asıl ayarlar.

### 2.4 Local çalışma (docker-compose)

`autodigits-backend/dev/local/docker-compose.yml`:
- mailpit, localstack, opensearch, postgres (uygulama + keycloak), keycloak, backend, pgadmin.
- Backend container ortam değişkenleri: `SPRING_PROFILES_ACTIVE=local`, DB URL, Keycloak issuer, AWS endpointler.

### 2.5 Güvenlik

`autodigits-app-boot/src/main/java/com/autodigits/security/SecurityConfig.java`:
- `/api/**` tüm istekler `authenticated`.
- Keycloak JWT Resource Server + rol dönüşümü (`KeycloakRealmRoleConverter`).
- TenantContext / CurrentUserContext filtreleri.

### 2.6 GDPR / DSGVO akışı (backend)

`autodigits-tenant/src/main/java/com/autodigits/tenant/controller/TenantPrivacyPolicyController.java`:
- `GET /api/tenant/privacy-policy/status`
- `POST /api/tenant/privacy-policy/accept`

---

## 3. Frontend (autodigits-frontend)

### 3.1 Ana bileşenler

`src/main.tsx`:
- `installMocks()` -> mock interceptor.
- `AuthProvider` -> Keycloak auth yönetimi.
- `App` (Router), `ThemeProvider`, global toaster.

`src/App.tsx`:
- Route ağacı, DsgvoGate, yetkilendirme (RoleRoute), sayfa yönlendirmeleri.

### 3.2 Auth

`src/app/auth`:
- `keycloak.ts`: Keycloak ayarları (env bazlı).
- `AuthProvider.tsx`: login/logout/refresh, token sync, idle timeout, `setAuthToken()`.
- `useApiAuthSync.ts`: state değişince Axios'a Authorization header set eder.

### 3.3 API istemci

`src/app/api`:
- `apiClient.ts`: Axios temel, `setAuthToken`, problem parser.
- `endpoints.ts`: API URL merkezi.
- `services.ts`: servisler (me, users, vehicles, tenant, vs.) - `wrap()` sonuç biçimi.
- `mock/mockAdapter.ts`: istek interceptorları ve response fallback mocking.
- `mock/vehicleMocks.ts`: araç veri seti, filtreleme, sayfalama, create.

### 3.4 GDPR/DSGVO

`src/app/compliance`:
- `DsgvoGate.tsx`: login sonrası DSGVO durum kontrolü, global admin bypass.
- `DsgvoPage.tsx`: kabul sayfası ve buton.
- `complianceApi.ts`: localStorage + backend status/accept çağrıları.

### 3.5 Araç modülü

`src/features/dealerUser`:
- `useVehicleList.ts`: query paramları, debounce, listeleme.
- `pages/VehiclesPage.tsx`: veh list UI.
- `pages/VehicleCreatePage.tsx`: create form.
- `api/services` çağrıları.

### 3.6 Router & yetki

`src/app/routing/RoleRoute.tsx`: rol kontrolü, anonymous durumunda login tetikler.
`src/app/roles`: rol enumerasyonu.

### 3.7 ortamlar

`.env.local`:
- VITE_API_BASE_URL=/ , VITE_DEV_PROXY_TARGET=http://localhost:9090, VITE_ENABLE_MOCKS=false, VITE_KEYCLOAK_...
`.env.dev` / `.env.prod`: gerçek URL.
`vite.config.ts`: proxy / port 5173.

### 3.8 Mock stratejisi

- `VITE_ENABLE_MOCKS=true` (tüm modülleri mocklar)
- `VITE_MOCK_MODULES=vehicles,banking,users,invoicing` (seçenekli)
- `mockAdapter` request interceptor`da token/başlık kontrolü yok, local state kullanır.

---

## 4. Adım adım çalışma rehberi

### 4.1 Tam ortam çalıştırma (ideal)
1. Docker Desktop aç.
2. `cd autodigits-backend/dev/local`
3. `docker compose up -d`
4. `cd ../../autodigits-frontend` -> `pnpm install` -> `pnpm dev`
5. Backend: `http://localhost:9090`, frontend: `http://localhost:5173`, Keycloak: `http://localhost:8180`.
6. İlk hesap: `admin/admin` (Keycloak'in realm import config içinden).

### 4.2 Backend olmadan saf frontend geliştirme
1. `.env.local` içinde `VITE_ENABLE_MOCKS=true`.
2. `pnpm dev`.
3. `localhost:5173` aç.
4. mock verilerle araç listesi ve oluşturma çalışır (önce `vehicles` module için `VITE_MOCK_MODULES=vehicles` ekleyebilirsiniz).
5. `/legal/dsgvo` akışı da mock ile çalışmalı.

### 4.3 Araç modülü geliştirme
- `useVehicleList.ts` içindeki `params` (search, page, size, sort, filter) mock adaptörde desteklenmiş.
- `vehicleMocks.ts` listede filtreleme, sıralama, sayfalama var.
- Yeni özellik -> `services.ts` eklendikten sonra aynı mock adaptörüyle çevrimiçi/çevrimdışı tayin edilebilir.

---

## 5. Önemli notlar
- Mevcut mimariye sadık kalmak için backend çağrıları silinmedi; mock sadece `Interceptor` üzerinden kısa devre.
- `AuthProvider` Keycloak token senkronizasyonu varsa tüm modül istekleri yetkili çalışır.
- `RoleRoute` oturum olmadan, bulunduğunuz yolun aynısını saklayıp login sonrası geri dönebilir.

---

## 6. Hızlı çözüm: DSGVO / 401 problemi
1. `/legal/dsgvo` route'una gelip login kullanıcıyı `AuthProvider.login(redirectPath)` ile aynı yerde tut.
2. `acceptDsgvo()` çağrısı yetkili token (`Authorization: Bearer`) ile yapılmalı.
3. Mock mode ise backend çağrısını kısayolla `mockAdapter` tipiyle geri dön.

Bu belge, projenin birinci elden hızlı kavranması ve modüler geliştirme için temel bir referans sağlamayı amaçlar.
