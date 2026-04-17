### 1) Assets 관련 공식 API 문서

#### 핵심 공식 문서
- **AEM Assets API 개요 / 개발자 레퍼런스**
  - https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/assets/admin/developer-reference-material-apis  
  - 설명: AEM Assets as a Cloud Service에서 어떤 API를 어떤 용도로 써야 하는지 정리한 **가장 좋은 출발점**입니다. [Developer references for Assets](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/assets/admin/developer-reference-material-apis)

- **AEM Assets HTTP API**
  - https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/assets/admin/mac-api-assets  
  - 설명: 자산의 CRUD, 메타데이터, rendition, comments 등을 다루는 REST API 문서입니다. [Assets HTTP API](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/assets/admin/mac-api-assets)

- **Content Fragments support in Assets HTTP API**
  - https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/assets/admin/assets-api-content-fragments  
  - 설명: 다만 이 문서는 현재 **deprecated 방향**이 명시되어 있고, Content Fragment 관련 처리는 OpenAPI 기반 API로 이동하라고 안내합니다. [Adobe Experience Manager as a Cloud Service Content Fragments Support in the Assets HTTP API](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/assets/admin/assets-api-content-fragments)

- **AEM OpenAPI-based APIs 개요**
  - https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/implementing/developing/open-api-based-apis  
  - 설명: AEM의 최신 OpenAPI 계열 API 접근 방식과 인증 방식을 설명하는 상위 문서입니다. [OpenAPI-Based APIs](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/implementing/developing/open-api-based-apis)

- **AEM APIs overview**
  - https://experienceleague.adobe.com/en/docs/experience-manager-learn/cloud-service/aem-apis/overview  
  - 설명: Assets API, OpenAPI, GraphQL 등 AEM API 전체 지형도를 빠르게 파악할 때 유용합니다. [AEM APIs overview](https://experienceleague.adobe.com/en/docs/experience-manager-learn/cloud-service/aem-apis/overview)

#### Dynamic Media / OpenAPI 관련
- **Dynamic Media with OpenAPI capabilities**
  - https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/assets/dynamicmedia/dynamic-media-open-apis/dynamic-media-open-apis-overview  
  - 설명: Dynamic Media with OpenAPI 기능 및 자산 검색/전달 시나리오를 다룹니다. [Dynamic Media with OpenAPI capabilities](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/assets/dynamicmedia/dynamic-media-open-apis/dynamic-media-open-apis-overview)

#### 참고 메모
- Assets 쪽은 현재 **Experience League 문서가 공식 진입점**이고, `developer-reference-material-apis` 문서가 개요 허브 역할을 합니다. [Developer references for Assets](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/assets/admin/developer-reference-material-apis)
- 일부 최신 Assets OpenAPI는 조기 채택/진화 중인 흐름이 릴리스 노트와 OpenAPI overview 문서에서 함께 언급됩니다. [Release Notes for 2025.3.0 release of Adobe Experience Manager as a Cloud Service.](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/release-notes/release-notes/2025/release-notes-2025-3-0) [OpenAPI-Based APIs](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/implementing/developing/open-api-based-apis)


### 2) Firefly 관련 공식 API 문서

#### 공개 공식 문서 / 웹사이트
- **Firefly API 문서 루트**
  - https://developer.adobe.com/firefly-services/docs/firefly-api/
  - 설명: 현재 Firefly API의 공식 공개 문서 진입점으로 내부 문서/Slack에서도 반복적으로 이 URL이 안내됩니다. [Firefly Service Onboarding, FAQ & Contacts](https://wiki.corp.adobe.com/spaces/GenAI/pages/3804947842/Firefly+Service+Onboarding+FAQ+Contacts) [Conversation from #corp-cc-sc-huddle channnel](https://adobe.enterprise.slack.com/archives/C06GAD7NMBQ/p1719236616.793649)

- **Firefly API Reference**
  - https://developer.adobe.com/firefly-services/docs/firefly-api/api/
  - 설명: 2026-01 기준으로 **all image endpoints를 통합한 consolidated API reference**라고 내부 공지가 있습니다. [Conversation from #firefly-service-support channnel](https://adobe.enterprise.slack.com/archives/C04DUFT283H/p1768425505.636769)

- **Firefly API Guides / prerequisites**
  - https://developer.adobe.com/firefly-services/docs/firefly-api/guides/
  - https://developer.adobe.com/firefly-services/docs/firefly-api/guides/#prerequisites
  - 설명: 가이드/사전준비 문서 위치로 지속적으로 안내되는 링크입니다. [Firefly Service Onboarding, FAQ & Contacts](https://wiki.corp.adobe.com/spaces/GenAI/pages/3804947842/Firefly+Service+Onboarding+FAQ+Contacts) [Conversation from #firefly-enterprise channnel](https://adobe.enterprise.slack.com/archives/C0598BZCF61/p1719569515.393119)

- **Firefly Services docs hub**
  - https://developer.adobe.com/firefly-services/docs/guides/
  - 설명: Firefly 서비스군 전체 문서 허브로, 내부 문서에서는 여기서 각 API Reference 탭으로 들어가라고 안내합니다. [Documentation repos](https://wiki.corp.adobe.com/spaces/GenAI/pages/3502282738/Documentation+repos) [Conversation from #firefly-enterprise channnel](https://adobe.enterprise.slack.com/archives/C0598BZCF61/p1719569515.393119)

#### 참고 메모
- Firefly 문서는 현재 **Experience League보다 developer.adobe.com/firefly-services 계열이 주 문서 축**으로 보입니다. [Documentation repos](https://wiki.corp.adobe.com/spaces/GenAI/pages/3502282738/Documentation+repos) [Create documentation for Firefly API](https://wiki.corp.adobe.com/display/GenAI/Create+documentation+for+Firefly+API)
- 내부 공지 기준으로 예전 개별 엔드포인트/legacy 링크는 점차 404가 될 수 있어 **루트 문서와 consolidated API reference**를 북마크하는 편이 안전합니다. [Conversation from #firefly-service-support channnel](https://adobe.enterprise.slack.com/archives/C04DUFT283H/p1768425505.636769)


### 3) MCP 관련 참조 자료

## 3-1) Assets 관련 MCP 문서

> **상태:** 확인됨  
> **문서 성격:** 현재는 **내부 Adobe용 공식 문서/Slack canvas** 기준으로 확인됨

- **AEM Remote MCP End-points**
  - 내부 문서: AEM용 원격 MCP 엔드포인트 정리
  - 특히 Assets 관련으로는 아래가 직접 연결됩니다:
    - `https://mcp.adobeaemcloud.com/adobe/mcp/discovery`
    - 설명: **AEM Assets (Cloud Services) 검색용 Discovery Tool**로 안내됨. [AEM Remote MCP End-points](https://adobe.enterprise.slack.com/docs/T024FAC20/F098QH2GJDC)

- **AEM Agents MCP overview**
  - 내부 문서:
    - `https://mcp.adobeaemcloud.com/adobe/mcp/discovery`
    - `https://mcp.adobeaemcloud.com/adobe/mcp/content`
    - `https://mcp.adobeaemcloud.com/adobe/mcp/content-readonly`
  - 설명:
    - `discovery`는 Assets/CF/Forms/Pages 검색
    - `content` / `content-readonly`는 자산 포함 콘텐츠 작업 범주로 정리됨. [AEM Agents MCP](https://adobe.enterprise.slack.com/docs/T024FAC20/F0A0LEWCAEP)

#### Assets MCP 참조 링크 목록
- https://mcp.adobeaemcloud.com/adobe/mcp/discovery  — Assets discovery/search용으로 내부 문서에 명시됨. [AEM Remote MCP End-points](https://adobe.enterprise.slack.com/docs/T024FAC20/F098QH2GJDC)
- https://mcp.adobeaemcloud.com/adobe/mcp/content  — content CRUD, assets 포함 범주. [AEM Remote MCP End-points](https://adobe.enterprise.slack.com/docs/T024FAC20/F098QH2GJDC)
- https://mcp.adobeaemcloud.com/adobe/mcp/content-readonly  — read-only content operations, assets 포함 범주. [AEM Remote MCP End-points](https://adobe.enterprise.slack.com/docs/T024FAC20/F098QH2GJDC)

## 3-2) Firefly 관련 MCP 문서

> **상태:** 별도 **공개 공식 Firefly MCP 문서**는 이번 확인 범위에서는 **명확히 확인되지 않음**

- 확인된 것은 **Firefly API 공식 문서**이며, 별도의 **Firefly 전용 MCP 서버 문서/공개 MCP endpoint 문서**는 찾지 못했습니다. [Firefly Service Onboarding, FAQ & Contacts](https://wiki.corp.adobe.com/spaces/GenAI/pages/3804947842/Firefly+Service+Onboarding+FAQ+Contacts) [Conversation from #firefly-service-support channnel](https://adobe.enterprise.slack.com/archives/C04DUFT283H/p1768425505.636769)

- 다만 내부적으로는 **Photoshop MCP server dependencies** 문서 안에 Firefly backend dependency가 언급되지만, 이것은 **Firefly를 위한 공식 MCP 문서**라기보다 **다른 MCP 서버의 내부 의존성 문서**에 가깝습니다. [PES Photoshop MCP Server Dependencies](https://wiki.corp.adobe.com/display/DIPES/PES+Photoshop+MCP+Server+Dependencies)

#### 결론
- **Assets MCP:** 있음, 내부 공식 문서 기준으로 확인됨. [AEM Remote MCP End-points](https://adobe.enterprise.slack.com/docs/T024FAC20/F098QH2GJDC)
- **Firefly MCP:** 이번 확인 기준으로는 **공개 공식 문서 없음 / 별도 공식 MCP 페이지 미확인**. Firefly는 현재 **API 문서 중심**으로 제공되는 것으로 보는 게 맞습니다. [Firefly Documentation](https://wiki.corp.adobe.com/spaces/GenAI/pages/3502282548/Firefly+Documentation) [Create documentation for Firefly API](https://wiki.corp.adobe.com/display/GenAI/Create+documentation+for+Firefly+API)


### 4) 빠른 요약 표

|영역|API/MCP 제공 여부|공식 문서 성격|바로 볼 링크|
|---|---|---|---|
|Assets API|있음|공개 공식 문서|https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/assets/admin/developer-reference-material-apis|
|Assets HTTP API|있음|공개 공식 문서|https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/assets/admin/mac-api-assets|
|Assets Dynamic Media OpenAPI|있음|공개 공식 문서|https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/assets/dynamicmedia/dynamic-media-open-apis/dynamic-media-open-apis-overview|
|Assets MCP|있음|내부 Adobe 공식 문서 기준|https://mcp.adobeaemcloud.com/adobe/mcp/discovery|
|Firefly API|있음|공개 공식 문서|https://developer.adobe.com/firefly-services/docs/firefly-api/|
|Firefly API Reference|있음|공개 공식 문서|https://developer.adobe.com/firefly-services/docs/firefly-api/api/|
|Firefly Guides|있음|공개 공식 문서|https://developer.adobe.com/firefly-services/docs/firefly-api/guides/|
|Firefly MCP|미확인|공개 공식 문서 미확인|N/A|