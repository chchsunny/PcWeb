# PcWeb – 電腦零件管理系統

一個使用 ASP.NET Core Web API 和 Next.js 打造的電腦零件管理與搜尋系統，整合 Redis 快取、Elasticsearch 全文搜尋等現代化技術。

---

## 技術架構

### 後端
- ASP.NET Core – Web API 框架  
- MSSQL – 關聯式資料庫  
- Redis – 分散式快取系統  
- Elasticsearch – 全文搜尋引擎  

### 前端
- Next.js – React 框架  
- TypeScript – 型別安全  

### DevOps
- Docker – 容器化部署  
- Jenkins – CI/CD 自動化  
- Jira – 專案管理與 Sprint 規劃  

---

## 功能特色

### API CRUD 設計
- 管理者新增、查詢、更新、刪除零件資料  
- 顯示所有零件  
- 零件分類  
- 多選零件計算總價  

---

### Elasticsearch 全文搜尋
- 支援模糊搜尋與拼字容錯  
- 搜尋 Name 與 Category 欄位  
- 降級機制：ES 故障時自動切換至資料庫搜尋  

---

### Redis 分散式快取
- 零件列表快取 30 分鐘  
- 資料變更時自動清除快取  
- 開發環境支援記憶體快取  

---

## Jenkins CI Pipeline

```groovy
pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/chchsunny/PcWeb.git'
            }
        }

        stage('Restore') {
            steps {
                powershell 'dotnet restore'
            }
        }

        stage('Build') {
            steps {
                powershell 'dotnet build --configuration Release'
            }
        }
    }
}
```

---

## Jira & Sprint 管理

### Sprint 1 – 基礎建設
- 資料庫設計與建立  
- 基本 CRUD API 開發  
- 前端框架建置  
- Docker 環境設定  

### Sprint 2 – 快取與搜尋
- Redis 快取整合  
- Elasticsearch 搜尋功能  
- 前端搜尋介面  
- 分類篩選功能  

### Sprint 3 – 優化與部署
- CI/CD Pipeline 建置  
- 效能優化  
- 錯誤處理與降級機制  
- 文件撰寫  

---
## 頁面展示

<img width="1919" height="752" alt="image" src="https://github.com/user-attachments/assets/9519a175-da75-46ed-bd1e-e7cf7084c7da" />