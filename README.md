# google-home-voicetext-gas
Google Homeをがなり立てる、Google Apps Script用スクリプトたち

## gcal.gs
Googleカレンダーの内容をお喋り

### 設定項目
設定はスクリプトプロパティに投入します。

アカウントに関わるシークレットな内容はbase64エンコードで入力します。

```
echo -n '{シークレットな内容}' | base64
e+OCt+ODvOOCr+ODrOODg+ODiOOBquWGheWuuX0=
```

#### CALENDAR_ACCOUNTS (JSON)
読み上げたいユーザーとカレンダーIDをJSON形式で指定します。

```
{ "(ユーザー名)": "(カレンダーID)" }
```

#### FIREBASE_IAM_PROJECTID (base64)
FirebaseのプロジェクトIDです。

```
echo -n "voicetext-xx012" | base64
```

#### FIREBASE_IAM_EMAIL (base64)
FirebaseのIAMアカウントです。

```
echo -n firebase-adminsdk-xxxx9@voicetext-xx012.iam.gserviceaccount.com | base64
```

#### FIREBASE_IAM_KEY (base64)
Firebaseで生成した認証鍵です。

```
echo -n "-----BEGIN PRIVATE KEY-----\nMIIEv......................=\n-----END PRIVATE KEY-----\n" | base64
```

#### FIREBASE_DOCPATH (任意)
Cloud Firestoreのドキュメントパスを指定します。

デフォルトは __googlehome/chant__ です。

```
/googlehome/voicetext
```

[google-home-voicetext-firebase](https://github.com/yasu-hide/google-home-voicetext-firebase)の`FIREBASE_DOCPATH`に合わせてください。

#### CALENDAR_TRIGGER_HOURS_WEEKDAY (任意)
平日の定期実行の時間を指定します。

デフォルトは __8__ 時です。

```
7
```

#### CALENDAR_TRIGGER_MINS_WEEKDAY (任意)
平日の定期実行の分を指定します。

デフォルトは __0__ 分です。

```
30
```

#### CALENDAR_TRIGGER_HOURS_DAYOFF (任意)
休日の定期実行の時間を指定します。

デフォルトは __8__ 時です。

```
9
```

#### CALENDAR_TRIGGER_MINS_DAYOFF (任意)
休日の定期実行の分を指定します。

デフォルトは __0__ 分です。

```
0
```

### 定時実行

スクリプトのトリガーを指定すると定時実行ができます。

実行する関数には`setTrigger`を指定してください。

次の例では7時から8時の時間のどこかでトリガーが登録されます。

`setTrigger`関数で読み上げをする時間が設定されて、定期実行のタイミングが確定します。

![gcal_trigger](gcal_trigger.png "トリガーを編集")

## GitHub Actions による自動デプロイ

### 必要な GitHub Variables

リポジトリの **Settings -> Secrets and variables -> Actions -> Variables** で以下を設定します。

| Variable キー | 内容 |
|---------------|------|
| `CLASP_SCRIPT_ID` | GAS スクリプト ID（GAS エディタの URL から取得） |
| `CALENDAR_ACCOUNTS` | カレンダーIDのJSON（例: `{"ユーザー名": "カレンダーID"}`） |
| `FIREBASE_DOCPATH` | Firestore ドキュメントパス（例: `googlehome/chant`） |
| `CALENDAR_TRIGGER_HOURS_WEEKDAY` | 平日トリガー時刻（時）（例: `8`） |
| `CALENDAR_TRIGGER_MINS_WEEKDAY` | 平日トリガー時刻（分）（例: `0`） |
| `CALENDAR_TRIGGER_HOURS_DAYOFF` | 休日トリガー時刻（時）（例: `9`） |
| `CALENDAR_TRIGGER_MINS_DAYOFF` | 休日トリガー時刻（分）（例: `0`） |

`.clasp.json` は GitHub Actions の実行時に `CLASP_SCRIPT_ID` から生成するため、リポジトリにはコミットしません。

### 必要な GitHub Secrets

リポジトリの **Settings -> Secrets and variables -> Actions -> Secrets** で以下を設定します。

| Secret キー | 内容 |
|-------------|------|
| `CLASPRC_JSON` | CLASP OAuth 認証情報（`~/.clasprc.json` の全内容） |

### GAS Script Properties に手動設定が必要な項目

以下の Firebase 認証情報は GitHub Actions には登録せず、GAS エディタの **プロジェクトの設定 -> スクリプト プロパティ** に直接入力します。

| キー | 内容 |
|------|------|
| `FIREBASE_IAM_KEY` | Firebase 秘密鍵（base64エンコード済み） |
| `FIREBASE_IAM_EMAIL` | Firebase IAM アカウント（base64エンコード済み） |
| `FIREBASE_IAM_PROJECTID` | Firebase プロジェクトID（base64エンコード済み） |

### 初回セットアップ手順

`clasp run` を使うには `clasp push` より追加の設定が必要です。

#### 1. CLASP の実行確認

```bash
pnpm dlx --package @google/clasp clasp --version
```

#### 2. Apps Script API の有効化

1. [Apps Script の設定](https://script.google.com/home/usersettings) を開く
2. **Google Apps Script API** を有効化

#### 3. CLASP 認証

```bash
pnpm dlx --package @google/clasp clasp login
```

この手順では `clasp` が用意している標準の OAuth クライアントを使います。`clasp` のために独自の OAuth クライアント ID や `client_secret.json` を作成する必要はありません。

認証が完了すると `~/.clasprc.json` が生成されます。このファイルの全内容を GitHub Secret `CLASPRC_JSON` に設定します。`~/.clasprc.json` はリポジトリにはコミットしません。

認証時に `エラー 403: access_denied` になる場合は、Google Workspace の管理者が `clasp` の OAuth クライアントを制限している可能性があります。その場合は管理者に `clasp` の利用許可を依頼するか、許可済みのアカウントで `clasp login` してください。

#### 4. GAS プロジェクトの初回デプロイ

`clasp run` は GAS プロジェクトが一度デプロイされている必要があります。

```bash
pnpm dlx --package @google/clasp clasp push --force
# その後 GAS エディタで「デプロイ」->「新しいデプロイ」を実行
```

### デプロイの動作確認

`master` ブランチへの push 後、GitHub Actions タブでワークフローの実行を確認します。

- `pnpm dlx --package @google/clasp clasp push --force`: コードの更新
- `pnpm dlx --package @google/clasp clasp run syncPropertiesFromGithub`: Script Properties の同期

CLASP の refresh token が失効した場合は、ローカルで `pnpm dlx --package @google/clasp clasp login` を再実行して `CLASPRC_JSON` を更新します。
