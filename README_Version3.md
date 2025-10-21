# خريطة المزرعة — واجهة عرض وتحرير GIS خفيفة

ملخص
-----
هذا المشروع يعرض خريطة مزرعتك كملف GeoJSON / KML، يسمح برؤية القطع، تحريرها، رسم قطع جديدة، تقسيم ودمج قطع، وحفظ التعديلات. الواجهة مبنية بـ Leaflet + Leaflet.draw + Turf. هناك دالة Netlify (serverless) مسمّاة `save` لحفظ الملف مباشرة إلى مستودع GitHub (آمنة باستخدام متغيّر بيئي ADMIN_SECRET وPersonal Access Token).

محتويات المشروع
----------------
- `index.html` — واجهة الويب التفاعلية (عرض/تحرير/تقسيم/دمج).
- `map (3).geojson` أو `map-3.geojson` — ملف البيانات (GeoJSON) الخاص بك.
- `netlify/functions/save.js` — دالة Netlify لحفظ GeoJSON إلى GitHub (اختياري).
- `README.md` — هذا الملف.

ملاحظة مهمة عن اسم ملف البيانات
------------------------------
يوصى بإزالة الفراغات في اسم الملف لتفادي مشاكل الروابط. إن أمكن أعد تسمية:
- من `map (3).geojson` إلى `map-3.geojson` أو `plots.geojson`.

كيفية التشغيل محلياً (خيار سريع)
--------------------------------
1. انسخ المستودع أو افتح المجلد محلياً.
2. ببساطة افتح `index.html` في المتصفح (double‑click أو File → Open).  
   - ملاحظة: بعض المتصفحات تمنع قراءة ملفات محلية عبر fetch؛ إن واجهت مشكلة، شغّل سيرفر محلي بسيط:

   بسيط باستخدام Python 3:
   ```
   python -m http.server 8000
   ```
   ثم افتح http://localhost:8000

3. الواجهة ستحاول تحميل ملف البيانات الافتراضي (إذا كان موجودًا بنفس الاسم). يمكنك استيراد KML/GeoJSON يدوياً من واجهة الموقع.

النشر عبر GitHub Pages (مجاني)
-----------------------------
1. ادفع كل الملفات إلى مستودع GitHub (branch `main`).
2. في GitHub: Repository → Settings → Pages → Source: Branch `main` / Folder `root` → Save.
3. بعد دقائق سيكون موقعك متاحاً على:
   `https://<your-username>.github.io/<your-repo>/`
   أو إن كان اسم المستودع `your-username.github.io` فسيكون على `https://your-username.github.io/`.

نشر مع حفظ تلقائي بواسطة Netlify (اختياري، موصى به)
-------------------------------------------------
الهدف: تمكين زر "حفظ تلقائي" في الواجهة ليكتب التغييرات مباشرة إلى ملف داخل المستودع.

1. أنشئ حساب Netlify (مجاني) ثم اربط الموقع بمستودع GitHub.
2. أضف الملفات كما هي في المستودع، بما في ذلك `netlify/functions/save.js`.
3. في Netlify Dashboard → Site settings → Build & deploy → Environment:
   - `GITHUB_TOKEN` = <Personal Access Token من GitHub>  
     (إنشئ token عبر GitHub Settings → Developer settings → Personal access tokens؛ امنحه صلاحية `repo` أو `repo:contents`)
   - `GITHUB_REPO` = yourusername/your-repo
   - `GITHUB_BRANCH` = main
   - `ADMIN_SECRET` = <سلسلة سرية قوية تختارها>
4. أعد نشر (Deploy) الموقع في Netlify. سيصبح endpoint الدالة متاحًا:
   `https://<yoursite>.netlify.app/.netlify/functions/save`

صيغة الطلب من الواجهة إلى الدالة
--------------------------------
الواجهة ترسل POST إلى endpoint أعلاه بصيغة JSON:
```json
{
  "admin_secret": "قيمة_ADMIN_SECRET",
  "commit_message": "رسالة الحفظ",
  "path": "data/plots.geojson",
  "content
