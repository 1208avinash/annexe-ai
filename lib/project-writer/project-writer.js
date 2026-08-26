// ───────────────────────────────────────────────────────────────
// ANNEXE AI V9
// Phase 12.2
// Project Writer
// BuildManifest → Workspace
// ───────────────────────────────────────────────────────────────

import fs from "fs";
import path from "path";

import WriteReport from "./contracts/write-report.js";

function normalizePath(filePath = "") {
    return String(filePath).replace(/\\/g, "/");
}

function makeFile(filePath, content, options = {}) {
    return {
        path: normalizePath(filePath),
        content,
        type: options.type ?? "source",
        language: options.language ?? "text",
        encoding: options.encoding ?? "utf8",
        overwrite: options.overwrite ?? true,
        executable: options.executable ?? false
    };
}

function block(text) {
    return text.trimStart();
}

const RTL_LOCALES = ["ar-SA", "he-IL", "fa-IR", "ur-PK"];

const LOCALE_LABELS = {
    "en-US": "English",
    "fr-FR": "Français",
    "es-ES": "Español",
    "de-DE": "Deutsch",
    "ar-SA": "العربية",
    "hi-IN": "हिन्दी",
    "zh-CN": "中文",
    "ja-JP": "日本語",
    "pt-BR": "Português",
    "it-IT": "Italiano"
};

function uniqueLocales(locales = []) {
    return Array.from(new Set(locales.filter(Boolean)));
}

function buildBackendMessageBundle(language, locale, englishErrorMessages, localizedErrorMessages) {
    const normalizedLocale = uniqueLocales([locale])[0] ?? "en-US";
    const english = {
        errors: {
            auth: {
                missingBearerToken: "Missing bearer token",
                invalidOrExpiredToken: "Invalid or expired token",
                invalidCredentials: "Invalid email or password",
                userNotFoundOrInactive: "User not found or inactive"
            },
            customers: {
                notFound: "Customer not found"
            },
            dashboard: {
                unavailable: "Unable to load dashboard"
            },
            general: {
                validation: englishErrorMessages.validation ?? "Please review the highlighted fields.",
                generic: englishErrorMessages.generic ?? "Something went wrong.",
                network: englishErrorMessages.network ?? "Network request failed."
            }
        }
    };

    const localizedByLanguage = {
        French: {
            errors: {
                auth: {
                    missingBearerToken: "Jeton du porteur manquant",
                    invalidOrExpiredToken: "Jeton invalide ou expiré",
                    invalidCredentials: "Adresse e-mail ou mot de passe invalide",
                    userNotFoundOrInactive: "Utilisateur introuvable ou inactif"
                },
                customers: {
                    notFound: "Client introuvable"
                },
                dashboard: {
                    unavailable: "Impossible de charger le tableau de bord"
                },
                general: {
                    validation: localizedErrorMessages.validation ?? "Veuillez vérifier les champs surlignés.",
                    generic: localizedErrorMessages.generic ?? "Une erreur est survenue.",
                    network: localizedErrorMessages.network ?? "La requête réseau a échoué."
                }
            }
        },
        Spanish: {
            errors: {
                auth: {
                    missingBearerToken: "Falta el token de acceso",
                    invalidOrExpiredToken: "Token inválido o caducado",
                    invalidCredentials: "Correo electrónico o contraseña inválidos",
                    userNotFoundOrInactive: "Usuario no encontrado o inactivo"
                },
                customers: {
                    notFound: "Cliente no encontrado"
                },
                dashboard: {
                    unavailable: "No se puede cargar el panel"
                },
                general: {
                    validation: localizedErrorMessages.validation ?? "Revise los campos resaltados.",
                    generic: localizedErrorMessages.generic ?? "Algo salió mal.",
                    network: localizedErrorMessages.network ?? "La solicitud de red falló."
                }
            }
        },
        German: {
            errors: {
                auth: {
                    missingBearerToken: "Fehlendes Bearer-Token",
                    invalidOrExpiredToken: "Ungültiges oder abgelaufenes Token",
                    invalidCredentials: "Ungültige E-Mail oder Passwort",
                    userNotFoundOrInactive: "Benutzer nicht gefunden oder inaktiv"
                },
                customers: {
                    notFound: "Kunde nicht gefunden"
                },
                dashboard: {
                    unavailable: "Dashboard kann nicht geladen werden"
                },
                general: {
                    validation: localizedErrorMessages.validation ?? "Bitte überprüfen Sie die markierten Felder.",
                    generic: localizedErrorMessages.generic ?? "Etwas ist schiefgelaufen.",
                    network: localizedErrorMessages.network ?? "Netzwerkanfrage fehlgeschlagen."
                }
            }
        }
    };

    const selected = normalizedLocale === "en-US"
        ? english
        : localizedByLanguage[language] ?? english;

    return {
        language,
        locale: normalizedLocale,
        defaultLocale: normalizedLocale,
        supportedLocales: normalizedLocale === "en-US" ? ["en-US"] : [normalizedLocale, "en-US"],
        translations: {
            "en-US": english,
            ...(normalizedLocale === "en-US" ? {} : { [normalizedLocale]: selected })
        }
    };
}

function buildLocalizationBundle(languageContext = null) {
    const localization = languageContext?.localization ?? {};
    const softwareLocalization = languageContext?.softwareLocalization ?? {};
    const documentationLocalization = languageContext?.documentationLocalization ?? {};
    const locale = languageContext?.generatedApplicationDefaultLocale ?? languageContext?.locale ?? "en-US";
    const normalizedLocale = uniqueLocales([locale])[0] ?? "en-US";
    const supportedLocales = normalizedLocale === "en-US"
        ? ["en-US"]
        : [normalizedLocale, "en-US"];
    const language = languageContext?.projectLanguage ?? languageContext?.language ?? "English";
    const direction = languageContext?.culturalAdaptation?.readingDirection
        ?? (softwareLocalization.rtl ? "rtl" : RTL_LOCALES.includes(normalizedLocale) ? "rtl" : "ltr");

    const englishUiLabels = {
        login: "Login",
        dashboard: "Dashboard",
        settings: "Settings",
        customers: "Customers",
        reports: "Reports",
        search: "Search",
        save: "Save",
        cancel: "Cancel"
    };
    const localizedUiLabels = localization.uiLabels ?? englishUiLabels;

    const englishMenuLabels = {
        home: "Home",
        customers: "Customers",
        analytics: "Analytics",
        settings: "Settings"
    };
    const localizedMenuLabels = localization.menuLabels ?? englishMenuLabels;

    const englishErrorMessages = {
        generic: "Something went wrong.",
        network: "Network request failed.",
        validation: "Please review the highlighted fields.",
        missingBearerToken: "Missing bearer token",
        invalidOrExpiredToken: "Invalid or expired token",
        invalidCredentials: "Invalid email or password",
        userNotFoundOrInactive: "User not found or inactive",
        customerNotFound: "Customer not found",
        dashboardUnavailable: "Unable to load dashboard",
        customersUnavailable: "Unable to load customers",
        customerUnavailable: "Unable to load customer",
        signInUnavailable: "Unable to sign in",
        loadingWorkspace: "Loading workspace..."
    };
    const localizedErrorMessages = localization.errorMessages ?? englishErrorMessages;

    const englishScreens = {
        login: englishUiLabels.login,
        dashboard: englishUiLabels.dashboard,
        customers: englishUiLabels.customers,
        settings: englishUiLabels.settings,
        reports: englishUiLabels.reports
    };
    const localizedScreens = softwareLocalization.screens ?? englishScreens;

    const englishButtons = {
        enter: "Enter ANNEXE AI",
        explore: "Explore Capabilities",
        save: "Save",
        cancel: "Cancel"
    };
    const localizedButtons = softwareLocalization.buttons ?? englishButtons;

    const englishFrontend = {
        email: "Email",
        password: "Password",
        signIn: "Sign in",
        signInProgress: "Signing in...",
        workspaceOverview: "Workspace overview",
        openCustomers: "Open customers",
        modules: "Modules",
        recentCustomers: "Recent customers",
        customerList: "Customer list",
        searchPlaceholder: "Search by name, company, owner, or email",
        backToCustomers: "Back to customers",
        loadingCustomerProfile: "Loading customer profile...",
        customerProfile: "Customer profile",
        details: "Details",
        notes: "Notes",
        noNotes: "No notes available for this customer.",
        noCompanyProvided: "No company provided",
        viewDetails: "View details",
        defaultCredentials: "Default credentials",
        authenticated: "Authenticated",
        signOut: "Sign out",
        active: "Active",
        users: "Users",
        totalAccounts: "Total accounts",
        currentlyActiveAccounts: "Currently active accounts",
        seededUsers: "Seeded users",
        visibleCustomers: "visible customers",
        totalRecords: "records",
        customerWorkspace: "workspace",
        emailLabel: "Email",
        passwordLabel: "Password",
        loadingWorkspace: "Loading workspace...",
        language: "Language",
        currentLanguage: "Current language",
        switchLanguage: "Switch language",
        welcomeBack: "Welcome back",
        monitorCRMActivity: "Monitor customer engagement, active accounts, and recent CRM activity.",
        enabledModules: "enabled modules",
        unknownCompany: "Unknown company",
        independentAccount: "Independent account",
        notProvided: "Not provided",
        unassigned: "Unassigned",
        created: "Created",
        unableToSignIn: "Unable to sign in",
        unableToLoadDashboard: "Unable to load dashboard",
        unableToLoadCustomers: "Unable to load customers",
        unableToLoadCustomer: "Unable to load customer"
    };
    const localizedFrontend = {
        email: localization.email ?? englishFrontend.email,
        password: localization.password ?? englishFrontend.password,
        signIn: localization.signIn ?? localization.uiLabels?.login ?? englishFrontend.signIn,
        signInProgress: localization.signInProgress ?? englishFrontend.signInProgress,
        workspaceOverview: localization.workspaceOverview ?? englishFrontend.workspaceOverview,
        openCustomers: localization.openCustomers ?? englishFrontend.openCustomers,
        modules: localization.modules ?? englishFrontend.modules,
        recentCustomers: localization.recentCustomers ?? englishFrontend.recentCustomers,
        customerList: localization.customerList ?? englishFrontend.customerList,
        searchPlaceholder: localization.searchPlaceholder ?? englishFrontend.searchPlaceholder,
        backToCustomers: localization.backToCustomers ?? englishFrontend.backToCustomers,
        loadingCustomerProfile: localization.loadingCustomerProfile ?? englishFrontend.loadingCustomerProfile,
        customerProfile: localization.customerProfile ?? englishFrontend.customerProfile,
        details: localization.details ?? englishFrontend.details,
        notes: localization.notes ?? englishFrontend.notes,
        noNotes: localization.noNotes ?? englishFrontend.noNotes,
        noCompanyProvided: localization.noCompanyProvided ?? englishFrontend.noCompanyProvided,
        viewDetails: localization.viewDetails ?? englishFrontend.viewDetails,
        defaultCredentials: localization.defaultCredentials ?? englishFrontend.defaultCredentials,
        authenticated: localization.authenticated ?? englishFrontend.authenticated,
        signOut: localization.signOut ?? englishFrontend.signOut,
        active: localization.active ?? englishFrontend.active,
        users: localization.users ?? englishFrontend.users,
        totalAccounts: localization.totalAccounts ?? englishFrontend.totalAccounts,
        currentlyActiveAccounts: localization.currentlyActiveAccounts ?? englishFrontend.currentlyActiveAccounts,
        seededUsers: localization.seededUsers ?? englishFrontend.seededUsers,
        visibleCustomers: localization.visibleCustomers ?? englishFrontend.visibleCustomers,
        totalRecords: localization.totalRecords ?? englishFrontend.totalRecords,
        customerWorkspace: localization.customerWorkspace ?? englishFrontend.customerWorkspace,
        emailLabel: localization.emailLabel ?? englishFrontend.emailLabel,
        passwordLabel: localization.passwordLabel ?? englishFrontend.passwordLabel,
        loadingWorkspace: localization.loadingWorkspace ?? englishFrontend.loadingWorkspace,
        language: localization.languageLabel ?? englishFrontend.language,
        currentLanguage: LOCALE_LABELS[normalizedLocale] ?? englishFrontend.currentLanguage,
        switchLanguage: localization.switchLanguage ?? englishFrontend.switchLanguage,
        welcomeBack: localization.welcomeBack ?? englishFrontend.welcomeBack,
        monitorCRMActivity: localization.monitorCRMActivity ?? englishFrontend.monitorCRMActivity,
        enabledModules: localization.enabledModules ?? englishFrontend.enabledModules,
        unknownCompany: localization.unknownCompany ?? englishFrontend.unknownCompany,
        independentAccount: localization.independentAccount ?? englishFrontend.independentAccount,
        notProvided: localization.notProvided ?? englishFrontend.notProvided,
        unassigned: localization.unassigned ?? englishFrontend.unassigned,
        created: localization.created ?? englishFrontend.created,
        unableToSignIn: localization.unableToSignIn ?? englishFrontend.unableToSignIn,
        unableToLoadDashboard: localization.unableToLoadDashboard ?? englishFrontend.unableToLoadDashboard,
        unableToLoadCustomers: localization.unableToLoadCustomers ?? englishFrontend.unableToLoadCustomers,
        unableToLoadCustomer: localization.unableToLoadCustomer ?? englishFrontend.unableToLoadCustomer
    };

    const englishDocumentation = {
        userManual: {
            title: "User Manual",
            summary: `Operational guidance for using the platform in English.`
        },
        apiDocumentation: {
            title: "API Documentation",
            summary: `API reference delivered in English.`
        },
        proposals: {
            title: "Proposal",
            summary: `Commercial proposal localized for English.`
        },
        reports: {
            title: "Reports",
            language: "English"
        }
    };
    const localizedDocumentation = documentationLocalization.userManual
        || documentationLocalization.apiDocumentation
        || documentationLocalization.proposals
        || documentationLocalization.reports
        ? {
            userManual: documentationLocalization.userManual ?? englishDocumentation.userManual,
            apiDocumentation: documentationLocalization.apiDocumentation ?? englishDocumentation.apiDocumentation,
            proposals: documentationLocalization.proposals ?? englishDocumentation.proposals,
            reports: documentationLocalization.reports ?? englishDocumentation.reports
        }
        : englishDocumentation;

    const backendMessages = buildBackendMessageBundle(language, normalizedLocale, englishErrorMessages, localizedErrorMessages);

    const englishBundle = {
        language: "English",
        locale: "en-US",
        direction: "ltr",
        supportedLocales: ["en-US"],
        uiLabels: englishUiLabels,
        menuLabels: englishMenuLabels,
        errorMessages: englishErrorMessages,
        screens: englishScreens,
        buttons: englishButtons,
        frontend: englishFrontend,
        documentation: englishDocumentation
    };

    const localizedBundle = {
        language,
        locale: normalizedLocale,
        direction,
        supportedLocales,
        uiLabels: localizedUiLabels,
        menuLabels: localizedMenuLabels,
        errorMessages: localizedErrorMessages,
        screens: localizedScreens,
        buttons: localizedButtons,
        frontend: localizedFrontend,
        documentation: localizedDocumentation
    };

    const translations = {
        "en-US": englishBundle
    };
    if (normalizedLocale !== "en-US") {
        translations[normalizedLocale] = localizedBundle;
    }

    return {
        language,
        locale: normalizedLocale,
        defaultLocale: normalizedLocale,
        projectDefaultLocale: normalizedLocale,
        organizationDefaultLocale: normalizedLocale,
        generatedApplicationDefaultLocale: normalizedLocale,
        direction,
        supportedLocales,
        runtimeSupportedLocales: supportedLocales,
        localeLabels: Object.fromEntries(
            supportedLocales.map((supportedLocale) => [
                supportedLocale,
                LOCALE_LABELS[supportedLocale] ?? (supportedLocale === normalizedLocale ? language : supportedLocale)
            ])
        ),
        rtlLocales: RTL_LOCALES,
        storageKey: "annexe.locale",
        uiLabels: localizedUiLabels,
        menuLabels: localizedMenuLabels,
        errorMessages: localizedErrorMessages,
        screens: localizedScreens,
        buttons: localizedButtons,
        frontend: localizedFrontend,
        documentation: localizedDocumentation,
        translations,
        backendMessages
    };
}

function resolveLanguageContext(manifest = {}, blueprint = {}) {
    return blueprint.metadata?.languageContext
        ?? manifest.languageContext
        ?? manifest.project?.languageContext
        ?? manifest.project?.request?.languageContext
        ?? manifest.request?.languageContext
        ?? manifest.request?.project?.languageContext
        ?? manifest.requestAnalysis?.languageContext
        ?? manifest.analysis?.languageContext
        ?? null;
}

export default class ProjectWriter {

    constructor(options = {}) {
        this.workspaceRoot = options.workspaceRoot ?? "workspace";
    }

    buildRootFiles({ projectName, blueprint, languageContext = null }) {
        const selectedCapabilities = blueprint.applicationAssembly?.selectedCapabilities ?? [];
        const localization = buildLocalizationBundle(languageContext ?? blueprint.metadata?.languageContext ?? null);
        const localeLine = `${localization.language} (${localization.locale})`;

        return [
            makeFile(
                "README.md",
                block(`
# ${projectName}

Generated by ANNEXE AI.

## Stack

- Backend: ${blueprint.metadata?.stack?.backend ?? blueprint.architecture?.backend ?? "FastAPI"}
- Frontend: ${blueprint.metadata?.stack?.frontend ?? blueprint.architecture?.frontend ?? "React + Vite"}
- Database: ${blueprint.metadata?.stack?.database ?? blueprint.architecture?.database ?? "PostgreSQL"}
- Default language: ${localeLine}
- Supported locales: ${localization.supportedLocales.join(", ")}

## Capability Layer

- ${selectedCapabilities.length ? selectedCapabilities.join("\n- ") : "Capability assembly is available in the blueprint."}
`),
                { type: "documentation", language: "markdown" }
            ),
            makeFile(
                "enterprise-crm.blueprint.json",
                JSON.stringify(blueprint, null, 2) + "\n",
                { type: "artifact", language: "json" }
            )
        ];
    }

    buildCapabilityFiles({ projectName, capabilities = [] }) {
        const selectedCapabilities = Array.isArray(capabilities) ? capabilities : [];

        const files = [
            makeFile("capabilities/README.md", block(`
# Capability Layer

This workspace is assembled from reusable capabilities.

Each capability keeps its own contract, documentation, dependency list, and implementation guidance.
`), { type: "documentation", language: "markdown" }),
            makeFile("capabilities/index.json", JSON.stringify({
                project: projectName,
                generatedAt: new Date().toISOString(),
                capabilities: selectedCapabilities.map(capability => ({
                    name: capability.name,
                    version: capability.version,
                    description: capability.description,
                    dependencies: capability.dependencies ?? [],
                    routes: capability.routes ?? []
                }))
            }, null, 2) + "\n", { type: "artifact", language: "json" })
        ];

        for (const capability of selectedCapabilities) {
            const capabilitySlug = String(capability.name ?? "")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");
            const capabilityRoot = `capabilities/${capabilitySlug}`;
            const dependencyPayload = {
                name: capability.name,
                version: capability.version,
                dependencies: capability.dependencies ?? [],
                compatibility: capability.compatibility ?? {}
            };

            files.push(
                makeFile(
                    `${capabilityRoot}/capability.json`,
                    JSON.stringify(capability, null, 2) + "\n",
                    { type: "artifact", language: "json" }
                ),
                makeFile(
                    `${capabilityRoot}/dependencies.json`,
                    JSON.stringify(dependencyPayload, null, 2) + "\n",
                    { type: "artifact", language: "json" }
                ),
                makeFile(
                    `${capabilityRoot}/backend/README.md`,
                    block(`
# ${capability.name} Backend

Routes: ${(capability.backend?.routes ?? capability.routes ?? []).join(", ") || "n/a"}

This capability plugs into the shared backend runtime instead of duplicating a separate service.
`),
                    { type: "documentation", language: "markdown" }
                ),
                makeFile(
                    `${capabilityRoot}/frontend/README.md`,
                    block(`
# ${capability.name} Frontend

Surfaces: ${(capability.frontend?.modules ?? []).join(", ") || "n/a"}

This capability contributes UI modules to the shared React application.
`),
                    { type: "documentation", language: "markdown" }
                ),
                makeFile(
                    `${capabilityRoot}/tests/README.md`,
                    block(`
# ${capability.name} Tests

Capability-level tests validate the contract, dependencies, and integration points for this module.
`),
                    { type: "documentation", language: "markdown" }
                ),
                makeFile(
                    `${capabilityRoot}/docs/README.md`,
                    block(`
# ${capability.name} Docs

Description: ${capability.description}

Dependencies: ${(capability.dependencies ?? []).join(", ") || "none"}
`),
                    { type: "documentation", language: "markdown" }
                )
            );
        }

        return files;
    }

    buildBackendTemplate({ projectName, modules, entities, services, apis, languageContext = null }) {
        const moduleList = modules.length ? modules : ["Authentication", "Dashboard", "Customers", "Reporting"];
        const entityList = entities.length ? entities : ["User", "Customer", "Activity"];
        const serviceList = services.length ? services : ["Authentication Service", "Customer Service"];
        const apiList = apis.length ? apis : ["/auth/login", "/auth/me", "/customers", "/crm/summary"];
        const defaultAdminEmail = "admin@annexe.ai";
        const defaultAdminPassword = "Admin123!";
        const localization = buildLocalizationBundle(languageContext);
        const defaultLocale = localization.locale;
        const seedCustomers = [
            {
                name: "Apex Retail Group",
                email: "hello@apexretail.com",
                company: "Apex Retail Group",
                status: "active",
                phone: "+1-202-555-0142",
                owner: "Enterprise Sales",
                notes: "High priority enterprise account."
            },
            {
                name: "Northwind Logistics",
                email: "ops@northwindlogistics.com",
                company: "Northwind Logistics",
                status: "active",
                phone: "+1-202-555-0168",
                owner: "Customer Success",
                notes: "Expansion candidate for Q3."
            },
            {
                name: "BluePeak Health",
                email: "care@bluepeakhealth.com",
                company: "BluePeak Health",
                status: "prospect",
                phone: "+1-202-555-0191",
                owner: "Sales Operations",
                notes: "Awaiting security review."
            }
        ];

        return [
            makeFile("backend/requirements.txt", [
                "fastapi>=0.115.0",
                "uvicorn[standard]>=0.30.0",
                "sqlalchemy>=2.0.0",
                "python-dotenv>=1.0.1"
            ].join("\n") + "\n", { type: "configuration", language: "text" }),
            makeFile("backend/Dockerfile", block(`
FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
`), { type: "configuration", language: "dockerfile" }),
            makeFile("backend/.env.example", [
                `APP_NAME=${projectName}`,
                "APP_ENV=development",
                "DATABASE_URL=sqlite:///./crm.db",
                "SECRET_KEY=change-me-in-production",
                "ACCESS_TOKEN_EXPIRE_MINUTES=480",
                `ADMIN_EMAIL=${defaultAdminEmail}`,
                `ADMIN_PASSWORD=${defaultAdminPassword}`,
                "CORS_ORIGINS=http://localhost:5173"
            ].join("\n") + "\n", { type: "configuration", language: "env" }),
            makeFile("backend/README.md", block(`
# ${projectName} Backend

## Features

- FastAPI application with OpenAPI documentation
- JWT authentication
- SQLAlchemy persistence
- Customer CRUD endpoints
- Seeded admin user and sample customers
- Default locale: ${defaultLocale}
- Supported locales: ${localization.supportedLocales.join(", ")}

## Default Login

- Email: ${defaultAdminEmail}
- Password: ${defaultAdminPassword}

## Run

1. Create a virtual environment.
2. Install dependencies from \`requirements.txt\`.
3. Start the app with \`python -m uvicorn app.main:app\`.
`), { type: "documentation", language: "markdown" }),
            makeFile("backend/app/__init__.py", "", { type: "source", language: "python" }),
            makeFile("backend/app/config.py", block(`
import os


class Settings:
    app_name = os.getenv("APP_NAME", "${projectName}")
    app_env = os.getenv("APP_ENV", "development")
    database_url = os.getenv("DATABASE_URL", "sqlite:///./crm.db")
    secret_key = os.getenv("SECRET_KEY", "change-me-in-production")
    access_token_expire_minutes = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))
    admin_email = os.getenv("ADMIN_EMAIL", "${defaultAdminEmail}")
    admin_password = os.getenv("ADMIN_PASSWORD", "${defaultAdminPassword}")
    cors_origins = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
        if origin.strip()
    ]


settings = Settings()
`), { type: "source", language: "python" }),
            makeFile("backend/app/database.py", block(`
from contextlib import contextmanager

from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import declarative_base, sessionmaker

from .config import settings


Base = declarative_base()

if settings.database_url.startswith("sqlite"):
    engine = create_engine(
        "sqlite:///:memory:",
        future=True,
        echo=False,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
else:
    engine = create_engine(settings.database_url, future=True, echo=False)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)


def init_db():
    from .models import crm  # noqa: F401

    Base.metadata.create_all(bind=engine)


@contextmanager
def session_scope():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def get_db():
    with session_scope() as db:
        yield db
`), { type: "source", language: "python" }),
            makeFile("backend/app/security.py", block(`
import base64
import hashlib
import hmac
import json
import secrets
import time

from fastapi import HTTPException, status


def _b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")


def _b64decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def hash_password(password: str, salt: str | None = None) -> str:
    salt_value = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt_value.encode("utf-8"),
        120000
    ).hex()
    return f"pbkdf2_sha256\${salt_value}\${digest}"


def verify_password(password: str, hashed_password: str) -> bool:
    try:
        _, salt_value, digest = hashed_password.split("$", 2)
    except ValueError:
        return False

    candidate = hash_password(password, salt_value)
    return hmac.compare_digest(candidate, hashed_password)


def create_access_token(subject: str, secret_key: str, expires_minutes: int, extra_claims: dict | None = None) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    issued_at = int(time.time())
    payload = {
        "sub": subject,
        "iat": issued_at,
        "exp": issued_at + (expires_minutes * 60)
    }
    if extra_claims:
        payload.update(extra_claims)

    signing_input = f"{_b64encode(json.dumps(header, separators=(',', ':')).encode('utf-8'))}.{_b64encode(json.dumps(payload, separators=(',', ':')).encode('utf-8'))}"
    signature = hmac.new(secret_key.encode("utf-8"), signing_input.encode("utf-8"), hashlib.sha256).digest()
    return f"{signing_input}.{_b64encode(signature)}"


def decode_access_token(token: str, secret_key: str) -> dict:
    try:
        header_part, payload_part, signature_part = token.split(".")
        signing_input = f"{header_part}.{payload_part}"
        expected_signature = _b64encode(
            hmac.new(secret_key.encode("utf-8"), signing_input.encode("utf-8"), hashlib.sha256).digest()
        )
        if not hmac.compare_digest(expected_signature, signature_part):
            raise ValueError("Invalid signature")

        payload = json.loads(_b64decode(payload_part))
        if int(payload.get("exp", 0)) < int(time.time()):
            raise ValueError("Token expired")
        return payload
    except Exception as exc:  # pragma: no cover - defensive auth guard
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        ) from exc
`), { type: "source", language: "python" }),
            makeFile("backend/app/models/__init__.py", block(`
from .crm import Base, Customer, User
`), { type: "source", language: "python" }),
            makeFile("backend/app/models/crm.py", block(`
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text

from ..database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(64), nullable=False, default="Administrator")
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=True)
    company = Column(String(255), nullable=True)
    status = Column(String(64), nullable=False, default="active")
    phone = Column(String(64), nullable=True)
    owner = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
`), { type: "source", language: "python" }),
            makeFile("backend/app/schemas/__init__.py", block(`
from .crm import CustomerCreate, CustomerRead, CustomerUpdate, DashboardSummary, LoginRequest, LoginResponse, UserRead
`), { type: "source", language: "python" }),
            makeFile("backend/app/schemas/crm.py", block(`
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


class CustomerBase(BaseModel):
    name: str
    email: str | None = None
    company: str | None = None
    phone: str | None = None
    status: str = "active"
    owner: str | None = None
    notes: str | None = None


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    company: str | None = None
    phone: str | None = None
    status: str | None = None
    owner: str | None = None
    notes: str | None = None


class CustomerRead(CustomerBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class DashboardSummary(BaseModel):
    project: str
    modules: list[str]
    customer_count: int
    active_customer_count: int
    user_count: int
    recent_customers: list[CustomerRead]
`), { type: "source", language: "python" }),
            makeFile("backend/app/repositories/__init__.py", block(`
from .crm_repository import CRMRepository
`), { type: "source", language: "python" }),
            makeFile("backend/app/repositories/crm_repository.py", block(`
from sqlalchemy import func, select

from ..models import Customer, User
from ..security import hash_password


class CRMRepository:
    @staticmethod
    def get_user_by_email(db, email: str):
        normalized_email = (email or "").strip().lower()
        if not normalized_email:
            return None
        return db.scalars(select(User).where(User.email == normalized_email)).first()

    @staticmethod
    def get_customer(db, customer_id: int):
        return db.get(Customer, customer_id)

    @staticmethod
    def list_customers(db):
        return db.scalars(select(Customer).order_by(Customer.created_at.desc(), Customer.id.desc())).all()

    @staticmethod
    def create_customer(db, payload):
        customer = Customer(**payload)
        db.add(customer)
        db.commit()
        db.refresh(customer)
        return customer

    @staticmethod
    def update_customer(db, customer: Customer, payload):
        for key, value in payload.items():
            if value is not None:
                setattr(customer, key, value)
        db.add(customer)
        db.commit()
        db.refresh(customer)
        return customer

    @staticmethod
    def delete_customer(db, customer: Customer):
        db.delete(customer)
        db.commit()

    @staticmethod
    def dashboard_summary(db, project_name: str, modules: list[str]):
        customer_count = db.scalar(select(func.count()).select_from(Customer)) or 0
        user_count = db.scalar(select(func.count()).select_from(User)) or 0
        active_customer_count = db.scalar(
            select(func.count()).select_from(Customer).where(Customer.status == "active")
        ) or 0
        recent_customers = db.scalars(
            select(Customer).order_by(Customer.created_at.desc(), Customer.id.desc()).limit(5)
        ).all()
        return {
            "project": project_name,
            "modules": modules,
            "customer_count": customer_count,
            "active_customer_count": active_customer_count,
            "user_count": user_count,
            "recent_customers": recent_customers
        }

    @staticmethod
    def ensure_seed_data(db, admin_email: str, admin_password: str, project_name: str):
        user = CRMRepository.get_user_by_email(db, admin_email)
        if user is None:
            db.add(
                User(
                    email=admin_email.lower(),
                    full_name=f"{project_name} Admin",
                    hashed_password=hash_password(admin_password),
                    role="Administrator",
                    is_active=True
                )
            )

        customer_count = db.scalar(select(func.count()).select_from(Customer)) or 0
        if customer_count == 0:
            samples = [
                {
                    "name": "Apex Retail Group",
                    "email": "hello@apexretail.com",
                    "company": "Apex Retail Group",
                    "status": "active",
                    "phone": "+1-202-555-0142",
                    "owner": "Enterprise Sales",
                    "notes": "High priority enterprise account."
                },
                {
                    "name": "Northwind Logistics",
                    "email": "ops@northwindlogistics.com",
                    "company": "Northwind Logistics",
                    "status": "active",
                    "phone": "+1-202-555-0168",
                    "owner": "Customer Success",
                    "notes": "Expansion candidate for Q3."
                },
                {
                    "name": "BluePeak Health",
                    "email": "care@bluepeakhealth.com",
                    "company": "BluePeak Health",
                    "status": "prospect",
                    "phone": "+1-202-555-0191",
                    "owner": "Sales Operations",
                    "notes": "Awaiting security review."
                }
            ]
            for customer in samples:
                db.add(Customer(**customer))

        db.commit()
`), { type: "source", language: "python" }),
            makeFile("backend/app/services/__init__.py", block(`
from .crm_service import CRMService
`), { type: "source", language: "python" }),
            makeFile("backend/app/services/crm_service.py", block(`
from fastapi import HTTPException, status

from ..config import settings
from ..localization import translate_message
from ..repositories.crm_repository import CRMRepository
from ..security import create_access_token, verify_password


class CRMService:
    def __init__(self):
        self.project_name = settings.app_name
        self.modules = ${JSON.stringify(moduleList, null, 2)}
        self.entities = ${JSON.stringify(entityList, null, 2)}
        self.services = ${JSON.stringify(serviceList, null, 2)}
        self.apis = ${JSON.stringify(apiList, null, 2)}

    def bootstrap(self, db):
        CRMRepository.ensure_seed_data(db, settings.admin_email, settings.admin_password, self.project_name)

    def login(self, db, payload, locale: str | None = None):
        user = CRMRepository.get_user_by_email(db, payload.email)
        if user is None or not verify_password(payload.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=translate_message("errors.auth.invalidCredentials", locale)
            )

        token = create_access_token(
            subject=user.email,
            secret_key=settings.secret_key,
            expires_minutes=settings.access_token_expire_minutes,
            extra_claims={
                "role": user.role,
                "full_name": user.full_name
            }
        )
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": user
        }

    def list_customers(self, db):
        return CRMRepository.list_customers(db)

    def get_customer(self, db, customer_id: int, locale: str | None = None):
        customer = CRMRepository.get_customer(db, customer_id)
        if customer is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=translate_message("errors.customers.notFound", locale))
        return customer

    def create_customer(self, db, payload):
        return CRMRepository.create_customer(db, payload.model_dump())

    def update_customer(self, db, customer_id: int, payload, locale: str | None = None):
        customer = self.get_customer(db, customer_id, locale)
        return CRMRepository.update_customer(db, customer, payload.model_dump(exclude_unset=True))

    def delete_customer(self, db, customer_id: int, locale: str | None = None):
        customer = self.get_customer(db, customer_id, locale)
        CRMRepository.delete_customer(db, customer)
        return {"deleted": True, "customer_id": customer_id}

    def summary(self, db):
        return CRMRepository.dashboard_summary(db, self.project_name, self.modules)
`), { type: "source", language: "python" }),
            makeFile("backend/app/dependencies.py", block(`
from fastapi import Depends, Header, HTTPException, Request, status
from sqlalchemy.orm import Session

from .config import settings
from .database import get_db
from .localization import resolve_request_locale, translate_message
from .repositories.crm_repository import CRMRepository
from .security import decode_access_token


def get_current_user(request: Request, authorization: str | None = Header(default=None), db: Session = Depends(get_db)):
    locale = resolve_request_locale(request)
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=translate_message("errors.auth.missingBearerToken", locale)
        )

    token = authorization.removeprefix("Bearer ").strip()
    try:
        payload = decode_access_token(token, settings.secret_key)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=translate_message("errors.auth.invalidOrExpiredToken", locale)
        ) from None
    user = CRMRepository.get_user_by_email(db, payload.get("sub", ""))
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=translate_message("errors.auth.userNotFoundOrInactive", locale)
        )
    return user
`), { type: "source", language: "python" }),
            makeFile("backend/app/routers/__init__.py", block(`
from .auth import router as auth_router
from .crm import router as crm_router
from .customers import router as customers_router
from .health import router as health_router
`), { type: "source", language: "python" }),
            makeFile("backend/app/routers/health.py", block(`
from fastapi import APIRouter

from ..config import settings

router = APIRouter(tags=["health"])


@router.get("/health")
def health():
    return {
        "status": "ok",
        "project": settings.app_name,
        "environment": settings.app_env
    }
`), { type: "source", language: "python" }),
            makeFile("backend/app/routers/auth.py", block(`
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from ..dependencies import get_current_user
from ..database import get_db
from ..localization import resolve_request_locale
from ..schemas import LoginRequest, LoginResponse, UserRead
from ..services.crm_service import CRMService

router = APIRouter(prefix="/auth", tags=["auth"])
service = CRMService()


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    return service.login(db, payload, resolve_request_locale(request))


@router.get("/me", response_model=UserRead)
def me(current_user=Depends(get_current_user)):
    return current_user
`), { type: "source", language: "python" }),
            makeFile("backend/app/routers/customers.py", block(`
from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from ..dependencies import get_current_user
from ..database import get_db
from ..localization import resolve_request_locale
from ..schemas import CustomerCreate, CustomerRead, CustomerUpdate
from ..services.crm_service import CRMService

router = APIRouter(prefix="/customers", tags=["customers"])
service = CRMService()


@router.get("", response_model=list[CustomerRead])
def list_customers(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return service.list_customers(db)


@router.get("/{customer_id}", response_model=CustomerRead)
def get_customer(customer_id: int, request: Request, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return service.get_customer(db, customer_id, resolve_request_locale(request))


@router.post("", response_model=CustomerRead, status_code=status.HTTP_201_CREATED)
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return service.create_customer(db, payload)


@router.put("/{customer_id}", response_model=CustomerRead)
def update_customer(customer_id: int, payload: CustomerUpdate, request: Request, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return service.update_customer(db, customer_id, payload, resolve_request_locale(request))


@router.delete("/{customer_id}")
def delete_customer(customer_id: int, request: Request, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return service.delete_customer(db, customer_id, resolve_request_locale(request))
`), { type: "source", language: "python" }),
            makeFile("backend/app/routers/crm.py", block(`
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..dependencies import get_current_user
from ..database import get_db
from ..schemas import DashboardSummary
from ..services.crm_service import CRMService

router = APIRouter(prefix="/crm", tags=["crm"])
service = CRMService()


@router.get("/summary", response_model=DashboardSummary)
def summary(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return service.summary(db)


@router.get("/modules")
def modules():
    return {"modules": service.modules}


@router.get("/apis")
def apis():
    return {"apis": service.apis}
`), { type: "source", language: "python" }),
            makeFile("backend/app/main.py", block(`
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import init_db
from .routers import auth_router, crm_router, customers_router, health_router
from .services.crm_service import CRMService


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name, version="1.0.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins or ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"]
    )

    @app.on_event("startup")
    def bootstrap_database():
        init_db()
        from .database import session_scope

        service = CRMService()
        with session_scope() as db:
            service.bootstrap(db)

    app.include_router(health_router)
    app.include_router(auth_router)
    app.include_router(customers_router)
    app.include_router(crm_router)

    @app.get("/")
    def root():
        return {
            "project": settings.app_name,
            "status": "ready"
        }

    return app


app = create_app()
`), { type: "source", language: "python" })
        ];
    }

    buildFrontendTemplate({ projectName, modules }) {
        const moduleList = modules.length ? modules : ["Authentication", "Dashboard", "Customers"];

        return [
            makeFile("frontend/package.json", JSON.stringify({
                name: projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                private: true,
                type: "module",
                scripts: {
                    build: "node scripts/build.mjs",
                    check: "node scripts/check.mjs"
                }
            }, null, 2) + "\n", { type: "configuration", language: "json" }),
            makeFile("frontend/vite.config.js", block(`
export default {
  root: ".",
  build: {
    outDir: "dist",
    emptyOutDir: true
  }
};
`), { type: "configuration", language: "javascript" }),
            makeFile("frontend/index.html", block(`
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`), { type: "markup", language: "html" }),
            makeFile("frontend/README.md", block(`
# ${projectName} Frontend

## Stack

- Vite-compatible structure
- React-style source layout
- Self-contained build script

## Build

\`\`\`bash
npm install
npm run build
\`\`\`
`), { type: "documentation", language: "markdown" }),
            makeFile("frontend/public/.gitkeep", "", { type: "placeholder", language: "text" }),
            makeFile("frontend/scripts/build.mjs", block(`
import fs from "fs";
import path from "path";

const root = process.cwd();
const dist = path.join(root, "dist");
const src = path.join(root, "src");

fs.mkdirSync(dist, { recursive: true });

const html = \`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
    <div id="root">
      <h1>${projectName}</h1>
      <p>Generated build artifact.</p>
      <ul>
        ${moduleList.map(moduleName => `<li>${moduleName}</li>`).join("\\n        ")}
      </ul>
    </div>
  </body>
</html>\`;

fs.writeFileSync(path.join(dist, "index.html"), html);
fs.writeFileSync(path.join(dist, "build-summary.json"), JSON.stringify({
  project: "${projectName}",
  sourceDir: src,
  generatedAt: new Date().toISOString()
}, null, 2));

console.log("Frontend build completed.");
`), { type: "source", language: "javascript" }),
            makeFile("frontend/scripts/check.mjs", block(`
import fs from "fs";
import path from "path";

const required = [
  "package.json",
  "vite.config.js",
  "index.html",
  "src/main.jsx",
  "src/App.jsx"
];

for (const file of required) {
  if (!fs.existsSync(path.join(process.cwd(), file))) {
    throw new Error(\`Missing required file: \${file}\`);
  }
}

console.log("Frontend structure check passed.");
`), { type: "source", language: "javascript" }),
            makeFile("frontend/src/main.jsx", block(`
import App from "./App.jsx";
import "./styles.css";

const root = document.getElementById("root");

if (root) {
  root.innerHTML = App();
}
`), { type: "source", language: "jsx" }),
            makeFile("frontend/src/App.jsx", block(`
import { renderLayout } from "./layouts/MainLayout.jsx";

export default function App() {
  return renderLayout({
    title: "${projectName}",
    modules: ${JSON.stringify(moduleList, null, 2)}
  });
}
`), { type: "source", language: "jsx" }),
            makeFile("frontend/src/layouts/MainLayout.jsx", block(`
export function renderLayout({ title, modules = [] }) {
  return \`
    <main class="app-shell">
      <section class="hero">
        <p class="eyebrow">ANNEXE AI</p>
        <h1>\${title}</h1>
        <p>Generated enterprise CRM foundation.</p>
      </section>
      <section class="modules">
        \${modules.map(module => \`<article class="card"><h2>\${module}</h2></article>\`).join("")}
      </section>
    </main>
  \`;
}
`), { type: "source", language: "jsx" }),
            makeFile("frontend/src/pages/Login.jsx", block(`
export default function Login() {
  return \`
    <main class="page">
      <h1>${projectName} Login</h1>
      <p>Secure access for sales and operations teams.</p>
    </main>
  \`;
}
`), { type: "source", language: "jsx" }),
            makeFile("frontend/src/pages/Dashboard.jsx", block(`
export default function Dashboard() {
  return \`
    <main class="page">
      <h1>${projectName} Dashboard</h1>
      <p>Customer, lead, and pipeline overview.</p>
    </main>
  \`;
}
`), { type: "source", language: "jsx" }),
            makeFile("frontend/src/pages/Customers.jsx", block(`
export default function Customers() {
  return \`
    <main class="page">
      <h1>Customers</h1>
      <p>Enterprise CRM customer management workspace.</p>
    </main>
  \`;
}
`), { type: "source", language: "jsx" }),
            makeFile("frontend/src/components/index.js", "export {};\n", { type: "source", language: "javascript" }),
            makeFile("frontend/src/layouts/index.js", "export {};\n", { type: "source", language: "javascript" }),
            makeFile("frontend/src/hooks/index.js", "export {};\n", { type: "source", language: "javascript" }),
            makeFile("frontend/src/services/index.js", "export {};\n", { type: "source", language: "javascript" }),
            makeFile("frontend/src/contexts/index.js", "export {};\n", { type: "source", language: "javascript" }),
            makeFile("frontend/src/assets/.gitkeep", "", { type: "placeholder", language: "text" }),
            makeFile("frontend/src/styles.css", block(`
:root {
  color-scheme: light;
  font-family: Inter, system-ui, sans-serif;
}

body {
  margin: 0;
  background: linear-gradient(180deg, #f8fbff, #eef3f8);
  color: #102030;
}

.app-shell,
.page {
  padding: 2rem;
}

.modules {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.card {
  padding: 1rem;
  border-radius: 16px;
  background: white;
  box-shadow: 0 10px 30px rgba(16, 32, 48, 0.08);
}
`), { type: "source", language: "css" })
        ];
    }

    buildFrontendTemplateV2({ projectName, modules, languageContext = null }) {
        const moduleList = modules.length ? modules : ["Authentication", "Dashboard", "Customers", "Reporting"];
        const defaultAdminEmail = "admin@annexe.ai";
        const defaultAdminPassword = "Admin123!";
        const localization = buildLocalizationBundle(languageContext);
        const defaultLocale = localization.locale;
        const htmlLang = defaultLocale.split("-")[0] || "en";

        return [
            makeFile("frontend/package.json", JSON.stringify({
                name: projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                private: true,
                type: "module",
                scripts: {
                    dev: "vite",
                    build: "vite build",
                    preview: "vite preview",
                    check: "node scripts/check.mjs"
                },
                dependencies: {
                    react: "^18.3.1",
                    "react-dom": "^18.3.1",
                    "react-router-dom": "^6.26.2"
                },
                devDependencies: {
                    "@vitejs/plugin-react": "^4.3.1",
                    vite: "^5.4.2"
                }
            }, null, 2) + "\n", { type: "configuration", language: "json" }),
            makeFile("frontend/vite.config.js", block(`
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173
  }
});
`), { type: "configuration", language: "javascript" }),
            makeFile("frontend/index.html", block(`
<!doctype html>
<html lang="${htmlLang}" dir="${localization.direction}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0f172a" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`), { type: "markup", language: "html" }),
            makeFile("frontend/README.md", block(`
# ${projectName} Frontend

## Features

- React Router powered navigation
- Login screen backed by the API client
- Dashboard, customer list, and customer detail views
- Default locale: ${defaultLocale}
- Supported locales: ${localization.supportedLocales.join(", ")}

## Default Login

- Email: ${defaultAdminEmail}
- Password: ${defaultAdminPassword}

## Run

\`\`\`bash
npm install
npm run build
\`\`\`
`), { type: "documentation", language: "markdown" }),
            makeFile("frontend/public/.gitkeep", "", { type: "placeholder", language: "text" }),
            makeFile("frontend/scripts/check.mjs", block(`
import fs from "fs";
import path from "path";

const required = [
  "package.json",
  "vite.config.js",
  "index.html",
  "src/main.jsx",
  "src/App.jsx",
  "src/pages/Login.jsx",
  "src/pages/Dashboard.jsx",
  "src/pages/Customers.jsx",
  "src/pages/CustomerDetails.jsx",
  "src/services/api.js",
  "src/contexts/AuthContext.jsx",
  "src/components/LanguageSelector.jsx",
  "src/localization/index.js",
  "src/localization/resources.js"
];

for (const file of required) {
  if (!fs.existsSync(path.join(process.cwd(), file))) {
    throw new Error(\`Missing required file: \${file}\`);
  }
}

console.log("Frontend structure check passed.");
`), { type: "source", language: "javascript" }),
            makeFile("frontend/src/main.jsx", block(`
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { LocalizationProvider, getCurrentLocale, getLocaleDirection } from "./localization/index.js";
import "./styles.css";

const initialLocale = getCurrentLocale();

document.documentElement.lang = initialLocale;
document.documentElement.dir = getLocaleDirection(initialLocale);

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <LocalizationProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </LocalizationProvider>
    </BrowserRouter>
  </StrictMode>
);
`), { type: "source", language: "jsx" }),
            makeFile("frontend/src/App.jsx", block(`
import { Navigate, Route, Routes } from "react-router-dom";

import { RequireAuth } from "./contexts/AuthContext.jsx";
import { MainLayout } from "./layouts/MainLayout.jsx";
import CustomerDetails from "./pages/CustomerDetails.jsx";
import Customers from "./pages/Customers.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <RequireAuth>
            <MainLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="customers" element={<Customers />} />
        <Route path="customers/:customerId" element={<CustomerDetails />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
`), { type: "source", language: "jsx" }),
            makeFile("frontend/src/layouts/MainLayout.jsx", block(`
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { LanguageSelector } from "../components/LanguageSelector.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { LOCALIZATION } from "../localization/index.js";

export function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">A</span>
          <div>
            <strong>${projectName}</strong>
            <p>{LOCALIZATION.screens.dashboard}</p>
          </div>
        </div>

        <nav className="nav">
          <NavLink to="/" end>
            {LOCALIZATION.screens.dashboard}
          </NavLink>
          <NavLink to="/customers">{LOCALIZATION.screens.customers}</NavLink>
        </nav>

        <div className="sidebar-footer">
          <p>{user?.full_name}</p>
          <button type="button" className="button button-secondary" onClick={handleLogout}>
            {LOCALIZATION.frontend.signOut}
          </button>
        </div>
      </aside>

      <main className="workspace">
        <header className="workspace-header">
          <div>
            <p className="eyebrow">ANNEXE AI</p>
            <h1>${projectName}</h1>
          </div>
          <div className="workspace-header-actions">
            <LanguageSelector />
            <div className="status-pill">{LOCALIZATION.frontend.authenticated}</div>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
}
`), { type: "source", language: "jsx" }),
            makeFile("frontend/src/contexts/AuthContext.jsx", block(`
import { createContext, useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { apiClient, clearStoredToken, getStoredToken, setStoredToken } from "../services/api.js";
import { LOCALIZATION } from "../localization/index.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function hydrate() {
      if (!token) {
        setReady(true);
        return;
      }

      try {
        const me = await apiClient.me(token);
        if (active) {
          setUser(me);
        }
      } catch {
        clearStoredToken();
        if (active) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (active) {
          setReady(true);
        }
      }
    }

    hydrate();

    return () => {
      active = false;
    };
  }, [token]);

  async function login(email, password) {
    const response = await apiClient.login({ email, password });
    setStoredToken(response.access_token);
    setToken(response.access_token);
    setUser(response.user);
    return response.user;
  }

  function logout() {
    clearStoredToken();
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function RequireAuth({ children }) {
  const { token, ready } = useAuth();
  const location = useLocation();

  if (!ready) {
    return <div className="screen screen-loading">{LOCALIZATION.frontend.loadingWorkspace}</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
`), { type: "source", language: "jsx" }),
            makeFile("frontend/src/services/api.js", block(`
import { LOCALIZATION, getCurrentLocale } from "../localization/index.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";
const TOKEN_KEY = "annexe.crm.token";

export function getStoredToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const {
    method = "GET",
    body,
    token = undefined,
    headers = {}
  } = options;

  const authToken = token === undefined ? getStoredToken() : token;
  const locale = getCurrentLocale();
  const response = await fetch(\`\${API_BASE_URL}\${path}\`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": locale,
      "X-Locale": locale,
      ...(authToken ? { Authorization: \`Bearer \${authToken}\` } : {}),
      ...headers
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.detail || payload?.message || LOCALIZATION.errorMessages.network);
  }

  return payload;
}

export const apiClient = {
  login(credentials) {
    return request("/auth/login", {
      method: "POST",
      body: credentials,
      token: null
    });
  },
  me(token) {
    return request("/auth/me", { token });
  },
  summary(token) {
    return request("/crm/summary", { token });
  },
  listCustomers(token) {
    return request("/customers", { token });
  },
  getCustomer(customerId, token) {
    return request(\`/customers/\${customerId}\`, { token });
  },
  createCustomer(payload, token) {
    return request("/customers", {
      method: "POST",
      body: payload,
      token
    });
  },
  updateCustomer(customerId, payload, token) {
    return request(\`/customers/\${customerId}\`, {
      method: "PUT",
      body: payload,
      token
    });
  },
  deleteCustomer(customerId, token) {
    return request(\`/customers/\${customerId}\`, {
      method: "DELETE",
      token
    });
  }
};
`), { type: "source", language: "javascript" }),
            makeFile("frontend/src/services/index.js", block(`
export { apiClient, clearStoredToken, getStoredToken, setStoredToken } from "./api.js";
`), { type: "source", language: "javascript" }),
            makeFile("frontend/src/layouts/index.js", block(`
export { MainLayout } from "./MainLayout.jsx";
`), { type: "source", language: "javascript" }),
            makeFile("frontend/src/contexts/index.js", block(`
export { AuthProvider, RequireAuth, useAuth } from "./AuthContext.jsx";
`), { type: "source", language: "javascript" }),
            makeFile("frontend/src/components/StatCard.jsx", block(`
export function StatCard({ label, value, note }) {
  return (
    <article className="stat-card">
      <p>{label}</p>
      <strong>{value}</strong>
      {note ? <span>{note}</span> : null}
    </article>
  );
}
`), { type: "source", language: "jsx" }),
            makeFile("frontend/src/components/LanguageSelector.jsx", block(`
import { LOCALIZATION, useLocalization } from "../localization/index.js";

export function LanguageSelector() {
  const { currentLocale, supportedLocales, setLocale, getLocaleLabel } = useLocalization();

  return (
    <label className="language-selector">
      <span>{LOCALIZATION.frontend.language}</span>
      <select
        aria-label={LOCALIZATION.frontend.switchLanguage}
        value={currentLocale}
        onChange={(event) => setLocale(event.target.value)}
      >
        {supportedLocales.map((locale) => (
          <option key={locale} value={locale}>
            {getLocaleLabel(locale)}
          </option>
        ))}
      </select>
    </label>
  );
}
`), { type: "source", language: "jsx" }),
            makeFile("frontend/src/components/index.js", block(`
export { StatCard } from "./StatCard.jsx";
export { LanguageSelector } from "./LanguageSelector.jsx";
`), { type: "source", language: "javascript" }),
            makeFile("frontend/src/localization/resources.js", block(`
export const LOCALIZATION = ${JSON.stringify(localization, null, 2)};
`), { type: "source", language: "javascript" }),
            makeFile("frontend/src/localization/index.js", block(`
import { createContext, createElement, useContext, useEffect, useMemo, useState } from "react";

import { LOCALIZATION as LOCALIZATION_RESOURCES } from "./resources.js";

const RAW_LOCALIZATION = JSON.parse(JSON.stringify(LOCALIZATION_RESOURCES));
const STORAGE_KEY = RAW_LOCALIZATION.storageKey ?? "annexe.locale";
const MEMORY_STORAGE = { value: null };
const LOCALE_LISTENERS = new Set();
const LocalizationContext = createContext(null);
const LOCALIZATION = {};

function normalizeLocale(locale) {
  if (!locale) {
    return null;
  }

  return String(locale).trim().replace(/_/g, "-");
}

export function getSupportedLocales() {
  const locales = Array.isArray(RAW_LOCALIZATION.supportedLocales) && RAW_LOCALIZATION.supportedLocales.length
    ? RAW_LOCALIZATION.supportedLocales
    : ["en-US"];
  return Array.from(new Set(locales.map(normalizeLocale).filter(Boolean)));
}

function isRtlLocale(locale) {
  const normalized = normalizeLocale(locale);
  return (RAW_LOCALIZATION.rtlLocales ?? []).includes(normalized);
}

function getLocaleLabel(locale) {
  const normalized = normalizeLocale(locale);
  return RAW_LOCALIZATION.localeLabels?.[normalized] ?? normalized ?? "English";
}

function createPreferenceStore() {
  const canUseWindowStorage = typeof window !== "undefined" && window.localStorage;

  return {
    get() {
      if (canUseWindowStorage) {
        return window.localStorage.getItem(STORAGE_KEY);
      }
      return MEMORY_STORAGE.value;
    },
    set(value) {
      if (canUseWindowStorage) {
        window.localStorage.setItem(STORAGE_KEY, value);
        return;
      }
      MEMORY_STORAGE.value = value;
    },
    clear() {
      if (canUseWindowStorage) {
        window.localStorage.removeItem(STORAGE_KEY);
        return;
      }
      MEMORY_STORAGE.value = null;
    }
  };
}

let preferenceStore = createPreferenceStore();
let currentLocale = resolveInitialLocale();

function getLocaleBundle(locale = currentLocale) {
  const normalized = resolveLocale(locale);
  return RAW_LOCALIZATION.translations?.[normalized] ?? RAW_LOCALIZATION.translations?.["en-US"] ?? RAW_LOCALIZATION;
}

function resolvePath(source, keyPath) {
  return String(keyPath)
    .split(".")
    .reduce((current, key) => current?.[key], source);
}

function formatTemplate(value, variables = {}) {
  if (typeof value !== "string") {
    return value;
  }

  return value.replace(/\{([^}]+)\}/g, (match, token) => {
    const replacement = variables[token.trim()];
    return replacement === undefined || replacement === null ? match : String(replacement);
  });
}

function resolveLocale(locale) {
  const normalized = normalizeLocale(locale);
  const supportedLocales = getSupportedLocales();

  if (normalized && supportedLocales.includes(normalized)) {
    return normalized;
  }

  if (normalized && normalized.includes("-")) {
    const languagePrefix = normalized.split("-")[0];
    const fallback = supportedLocales.find((candidate) => candidate.startsWith(languagePrefix + "-") || candidate === languagePrefix);
    if (fallback) {
      return fallback;
    }
  }

  const projectDefault = normalizeLocale(RAW_LOCALIZATION.projectDefaultLocale ?? RAW_LOCALIZATION.defaultLocale);
  if (projectDefault && supportedLocales.includes(projectDefault)) {
    return projectDefault;
  }

  const generatedDefault = normalizeLocale(RAW_LOCALIZATION.generatedApplicationDefaultLocale ?? projectDefault);
  if (generatedDefault && supportedLocales.includes(generatedDefault)) {
    return generatedDefault;
  }

  return supportedLocales.includes("en-US") ? "en-US" : (supportedLocales[0] ?? "en-US");
}

function resolveBrowserLocale() {
  if (typeof navigator === "undefined") {
    return null;
  }

  const candidates = [
    navigator.language,
    ...(Array.isArray(navigator.languages) ? navigator.languages : [])
  ].map(normalizeLocale).filter(Boolean);

  for (const candidate of candidates) {
    const resolved = resolveLocale(candidate);
    if (resolved) {
      return resolved;
    }
  }

  return null;
}

function resolveInitialLocale() {
  const stored = preferenceStore.get();
  if (stored) {
    return resolveLocale(stored);
  }

  const projectDefault = resolveLocale(RAW_LOCALIZATION.projectDefaultLocale ?? RAW_LOCALIZATION.defaultLocale);
  if (projectDefault) {
    return projectDefault;
  }

  const generatedDefault = resolveLocale(RAW_LOCALIZATION.generatedApplicationDefaultLocale);
  if (generatedDefault) {
    return generatedDefault;
  }

  const browserLocale = resolveBrowserLocale();
  if (browserLocale) {
    return browserLocale;
  }

  return "en-US";
}

function notifyLocaleChange(locale) {
  LOCALE_LISTENERS.forEach((listener) => {
    try {
      listener(locale);
    } catch {
      // Listener failures should not break locale switching.
    }
  });
}

function applyDocumentLocale(locale) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.lang = locale;
  document.documentElement.dir = isRtlLocale(locale) ? "rtl" : "ltr";
}

export function configureLocalePreferenceStore(adapter) {
  if (!adapter) {
    preferenceStore = createPreferenceStore();
    return preferenceStore;
  }

  preferenceStore = {
    get: typeof adapter.get === "function" ? () => adapter.get() : () => null,
    set: typeof adapter.set === "function" ? (value) => adapter.set(value) : () => {},
    clear: typeof adapter.clear === "function" ? () => adapter.clear() : () => {}
  };
  return preferenceStore;
}

export function getStoredLocalePreference() {
  return preferenceStore.get();
}

export function getCurrentLocale() {
  return currentLocale;
}

export function getLocaleDirection(locale = currentLocale) {
  return isRtlLocale(locale) ? "rtl" : "ltr";
}

export function setLocale(locale, options = {}) {
  const resolved = resolveLocale(locale);
  currentLocale = resolved;
  if (options.persist !== false) {
    preferenceStore.set(resolved);
  }
  applyDocumentLocale(resolved);
  notifyLocaleChange(resolved);
  return resolved;
}

export function subscribeLocale(listener) {
  LOCALE_LISTENERS.add(listener);
  return () => LOCALE_LISTENERS.delete(listener);
}

export function translate(keyPath, variables = {}, fallback = "") {
  const activeBundle = getLocaleBundle(currentLocale);
  const englishBundle = getLocaleBundle("en-US");
  const activeValue = resolvePath(activeBundle, keyPath);
  const fallbackValue = resolvePath(englishBundle, keyPath);
  const resolvedValue = activeValue ?? fallbackValue ?? fallback ?? keyPath;
  return formatTemplate(resolvedValue, variables);
}

export function formatLocalizedDate(value, options = {}) {
  const date = value ? new Date(value) : new Date();
  return new Intl.DateTimeFormat(getCurrentLocale(), {
    dateStyle: "medium",
    timeStyle: "short",
    ...options
  }).format(date);
}

export function useLocalization() {
  const [locale, setLocaleState] = useState(() => getCurrentLocale());

  useEffect(() => subscribeLocale(setLocaleState), []);

  const bundle = getLocaleBundle(locale);

  return {
    locale,
    currentLocale: locale,
    supportedLocales: getSupportedLocales(),
    localeLabels: RAW_LOCALIZATION.localeLabels ?? {},
    rtlLocales: RAW_LOCALIZATION.rtlLocales ?? [],
    direction: getLocaleDirection(locale),
    translationReady: Boolean(bundle),
    setLocale,
    getCurrentLocale,
    getSupportedLocales,
    getLocaleLabel,
    getStoredLocalePreference,
    translate,
    formatLocalizedDate,
    isRtlLocale
  };
}

export function LocalizationProvider({ children }) {
  const [locale, setLocaleState] = useState(() => getCurrentLocale());

  useEffect(() => {
    applyDocumentLocale(locale);
    return subscribeLocale(setLocaleState);
  }, [locale]);

  const value = useMemo(() => ({
    locale,
    currentLocale: locale,
    supportedLocales: getSupportedLocales(),
    localeLabels: RAW_LOCALIZATION.localeLabels ?? {},
    rtlLocales: RAW_LOCALIZATION.rtlLocales ?? [],
    direction: getLocaleDirection(locale),
    setLocale,
    getCurrentLocale,
    getSupportedLocales,
    getLocaleLabel,
    getStoredLocalePreference,
    translate,
    formatLocalizedDate,
    isRtlLocale
  }), [locale]);

  return createElement(LocalizationContext.Provider, { value }, children);
}

export function useLocalizationContext() {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error("useLocalizationContext must be used within a LocalizationProvider");
  }
  return context;
}

const dynamicBundleKeys = [
  "language",
  "locale",
  "defaultLocale",
  "projectDefaultLocale",
  "organizationDefaultLocale",
  "generatedApplicationDefaultLocale",
  "direction",
  "supportedLocales",
  "runtimeSupportedLocales",
  "localeLabels",
  "rtlLocales",
  "storageKey",
  "uiLabels",
  "menuLabels",
  "errorMessages",
  "screens",
  "buttons",
  "frontend",
  "documentation",
  "translations"
];

for (const key of dynamicBundleKeys) {
  Object.defineProperty(LOCALIZATION, key, {
    get() {
      const bundle = getLocaleBundle(currentLocale);
      if (key === "translations" || key === "storageKey" || key === "rtlLocales" || key === "localeLabels") {
        return RAW_LOCALIZATION[key];
      }
      if (key === "supportedLocales" || key === "runtimeSupportedLocales") {
        return getSupportedLocales();
      }
      return bundle[key] ?? RAW_LOCALIZATION[key];
    },
    enumerable: true,
    configurable: true
  });
}

export { LOCALIZATION };
`), { type: "source", language: "javascript" }),
            makeFile("frontend/src/pages/Login.jsx", block(`
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { LanguageSelector } from "../components/LanguageSelector.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { LOCALIZATION } from "../localization/index.js";

const DEFAULT_EMAIL = "${defaultAdminEmail}";
const DEFAULT_PASSWORD = "${defaultAdminPassword}";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(email, password);
      const destination = location.state?.from || "/";
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || LOCALIZATION.frontend.unableToSignIn);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-card-header">
          <p className="eyebrow">{LOCALIZATION.screens.login}</p>
          <LanguageSelector />
        </div>
        <h1>${projectName}</h1>
        <p className="auth-copy">
          {LOCALIZATION.buttons.enter}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            {LOCALIZATION.frontend.email}
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
          </label>
          <label>
            {LOCALIZATION.frontend.password}
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
            />
          </label>

          {error ? <div className="form-error">{error}</div> : null}

          <button type="submit" className="button button-primary" disabled={submitting}>
            {submitting ? LOCALIZATION.frontend.signInProgress : LOCALIZATION.frontend.signIn}
          </button>
        </form>

        <p className="helper-text">
          {LOCALIZATION.frontend.defaultCredentials}: <strong>{DEFAULT_EMAIL}</strong> / <strong>{DEFAULT_PASSWORD}</strong>
        </p>
      </section>
    </main>
  );
}
`), { type: "source", language: "jsx" }),
            makeFile("frontend/src/pages/Dashboard.jsx", block(`
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { StatCard } from "../components/StatCard.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { apiClient } from "../services/api.js";
import { LOCALIZATION } from "../localization/index.js";

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSummary() {
      try {
        const data = await apiClient.summary();
        if (active) {
          setSummary(data);
        }
      } catch (err) {
        if (active) {
          setError(err.message || LOCALIZATION.frontend.unableToLoadDashboard);
        }
      }
    }

    loadSummary();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="content-stack">
      <div className="hero-card">
        <div>
          <p className="eyebrow">{LOCALIZATION.screens.dashboard}</p>
          <h2>{LOCALIZATION.frontend.welcomeBack}, {user?.full_name ?? "Admin"}.</h2>
          <p>{LOCALIZATION.frontend.monitorCRMActivity}</p>
        </div>
        <Link className="button button-primary" to="/customers">
          {LOCALIZATION.frontend.openCustomers}
        </Link>
      </div>

      {error ? <div className="form-error">{error}</div> : null}

      <div className="stats-grid">
        <StatCard label={LOCALIZATION.uiLabels.customers} value={summary?.customer_count ?? "..."} note={LOCALIZATION.frontend.totalAccounts} />
        <StatCard
          label={LOCALIZATION.frontend.active}
          value={summary?.active_customer_count ?? "..."}
          note={LOCALIZATION.frontend.currentlyActiveAccounts}
        />
        <StatCard label={LOCALIZATION.frontend.users} value={summary?.user_count ?? "..."} note={LOCALIZATION.frontend.seededUsers} />
      </div>

      <section className="panel">
        <div className="panel-header">
          <h3>{LOCALIZATION.frontend.modules}</h3>
          <span>{summary?.modules?.length ?? 0} {LOCALIZATION.frontend.enabledModules}</span>
        </div>
        <div className="chip-row">
          {(summary?.modules ?? []).map((moduleName) => (
            <span className="chip" key={moduleName}>
              {moduleName}
            </span>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h3>{LOCALIZATION.frontend.recentCustomers}</h3>
          <span>{summary?.recent_customers?.length ?? 0} {LOCALIZATION.frontend.totalRecords}</span>
        </div>
        <div className="recent-list">
          {(summary?.recent_customers ?? []).map((customer) => (
            <Link className="recent-item" to={"/customers/" + customer.id} key={customer.id}>
              <strong>{customer.name}</strong>
              <span>
                {customer.company ?? LOCALIZATION.frontend.unknownCompany} · {customer.status}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </section>
  );
}
`), { type: "source", language: "jsx" }),
            makeFile("frontend/src/pages/Customers.jsx", block(`
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { apiClient } from "../services/api.js";
import { LOCALIZATION } from "../localization/index.js";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCustomers() {
      try {
        const data = await apiClient.listCustomers();
        if (active) {
          setCustomers(data);
        }
      } catch (err) {
        if (active) {
          setError(err.message || LOCALIZATION.frontend.unableToLoadCustomers);
        }
      }
    }

    loadCustomers();

    return () => {
      active = false;
    };
  }, []);

  const filteredCustomers = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return customers;
    }

    return customers.filter((customer) => {
      return [customer.name, customer.company, customer.email, customer.owner]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term));
    });
  }, [customers, query]);

  return (
    <section className="content-stack">
      <div className="panel">
        <div className="panel-header">
          <h2>{LOCALIZATION.frontend.customerList}</h2>
          <span>{filteredCustomers.length} {LOCALIZATION.frontend.visibleCustomers}</span>
        </div>
        <input
          className="search-input"
          placeholder={LOCALIZATION.frontend.searchPlaceholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {error ? <div className="form-error">{error}</div> : null}

      <div className="customer-grid">
        {filteredCustomers.map((customer) => (
          <article className="customer-card" key={customer.id}>
            <div className="customer-card-header">
              <div>
                <h3>{customer.name}</h3>
                <p>{customer.company ?? LOCALIZATION.frontend.independentAccount}</p>
              </div>
              <span className={"status-pill status-" + customer.status}>{customer.status}</span>
            </div>
            <dl>
              <div>
                <dt>Email</dt>
                <dd>{customer.email ?? LOCALIZATION.frontend.notProvided}</dd>
              </div>
              <div>
                <dt>Owner</dt>
                <dd>{customer.owner ?? LOCALIZATION.frontend.unassigned}</dd>
              </div>
            </dl>
            <Link className="button button-secondary" to={"/customers/" + customer.id}>
              {LOCALIZATION.frontend.viewDetails}
            </Link>
          </article>
          ))}
      </div>
    </section>
  );
}
`), { type: "source", language: "jsx" }),
            makeFile("frontend/src/pages/CustomerDetails.jsx", block(`
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { apiClient } from "../services/api.js";
import { LOCALIZATION, formatLocalizedDate } from "../localization/index.js";

export default function CustomerDetails() {
  const { customerId } = useParams();
  const [customer, setCustomer] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCustomer() {
      try {
        const data = await apiClient.getCustomer(customerId);
        if (active) {
          setCustomer(data);
        }
      } catch (err) {
        if (active) {
          setError(err.message || LOCALIZATION.frontend.unableToLoadCustomer);
        }
      }
    }

    loadCustomer();

    return () => {
      active = false;
    };
  }, [customerId]);

  if (error) {
    return (
      <section className="content-stack">
        <div className="panel">
          <p className="form-error">{error}</p>
          <Link className="button button-secondary" to="/customers">
            {LOCALIZATION.frontend.backToCustomers}
          </Link>
        </div>
      </section>
    );
  }

  if (!customer) {
    return (
      <section className="content-stack">
        <div className="panel">{LOCALIZATION.frontend.loadingCustomerProfile}</div>
      </section>
    );
  }

  return (
    <section className="content-stack">
      <div className="hero-card">
        <div>
          <p className="eyebrow">{LOCALIZATION.frontend.customerProfile}</p>
          <h2>{customer.name}</h2>
          <p>{customer.company ?? LOCALIZATION.frontend.noCompanyProvided}</p>
        </div>
        <Link className="button button-secondary" to="/customers">
          {LOCALIZATION.frontend.backToCustomers}
        </Link>
      </div>

      <section className="panel">
        <div className="panel-header">
          <h3>{LOCALIZATION.frontend.customerProfile}</h3>
          <span className={"status-pill status-" + customer.status}>{customer.status}</span>
        </div>
        <dl className="detail-grid">
          <div>
            <dt>Email</dt>
            <dd>{customer.email ?? LOCALIZATION.frontend.notProvided}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>{customer.phone ?? LOCALIZATION.frontend.notProvided}</dd>
          </div>
          <div>
            <dt>Owner</dt>
            <dd>{customer.owner ?? LOCALIZATION.frontend.unassigned}</dd>
          </div>
          <div>
            <dt>{LOCALIZATION.frontend.created}</dt>
            <dd>{formatLocalizedDate(customer.created_at)}</dd>
          </div>
        </dl>
      </section>

      <section className="panel">
        <h3>{LOCALIZATION.frontend.notes}</h3>
        <p>{customer.notes ?? LOCALIZATION.frontend.noNotes}</p>
      </section>
    </section>
  );
}
`), { type: "source", language: "jsx" }),
            makeFile("frontend/src/hooks/index.js", block(`
export {};
`), { type: "source", language: "javascript" }),
            makeFile("frontend/src/assets/.gitkeep", "", { type: "placeholder", language: "text" }),
            makeFile("frontend/src/styles.css", block(`
:root {
  color-scheme: dark;
  font-family: Inter, "Segoe UI", system-ui, sans-serif;
  background: #08111f;
  color: #e6eefc;
  line-height: 1.5;
  font-weight: 400;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(68, 114, 196, 0.28), transparent 35%),
    radial-gradient(circle at top right, rgba(20, 184, 166, 0.18), transparent 32%),
    linear-gradient(180deg, #08111f 0%, #0c1729 100%);
}

a {
  color: inherit;
  text-decoration: none;
}

button,
input {
  font: inherit;
}

#root {
  min-height: 100vh;
}

.screen,
.app-shell,
.auth-shell {
  min-height: 100vh;
}

.screen-loading {
  display: grid;
  place-items: center;
  color: #94a3b8;
}

.auth-shell {
  display: grid;
  place-items: center;
  padding: 2rem;
}

.auth-card,
.panel,
.hero-card,
.customer-card,
.stat-card {
  background: rgba(10, 18, 32, 0.82);
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 24px 80px rgba(2, 6, 23, 0.42);
  backdrop-filter: blur(18px);
}

.auth-card {
  width: min(100%, 460px);
  padding: 2rem;
  border-radius: 24px;
}

.auth-card-header,
.workspace-header-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.language-selector {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.5rem 0.75rem;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.88);
  border: 1px solid rgba(148, 163, 184, 0.22);
  color: #cbd5e1;
}

.language-selector span {
  font-size: 0.82rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.language-selector select {
  border: 0;
  background: transparent;
  color: #f8fafc;
  font: inherit;
}

.auth-form,
.content-stack {
  display: grid;
  gap: 1rem;
}

.auth-form label {
  display: grid;
  gap: 0.4rem;
  color: #cbd5e1;
}

.auth-form input,
.search-input {
  width: 100%;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(15, 23, 42, 0.9);
  color: #e2e8f0;
  padding: 0.85rem 1rem;
}

.auth-copy,
.helper-text,
.panel span,
.customer-card p,
.recent-item span,
.stat-card span,
.stat-card p {
  color: #94a3b8;
}

.form-error {
  padding: 0.85rem 1rem;
  border-radius: 14px;
  background: rgba(127, 29, 29, 0.22);
  color: #fecaca;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 0;
  border-radius: 14px;
  padding: 0.85rem 1.1rem;
  cursor: pointer;
  transition: transform 0.18s ease, background 0.18s ease, color 0.18s ease;
}

.button:hover {
  transform: translateY(-1px);
}

.button-primary {
  background: linear-gradient(135deg, #2563eb, #06b6d4);
  color: #f8fbff;
}

.button-secondary {
  background: rgba(30, 41, 59, 0.9);
  color: #e2e8f0;
}

.app-shell {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
}

.sidebar {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.5rem;
  border-right: 1px solid rgba(148, 163, 184, 0.14);
  background: rgba(2, 6, 23, 0.58);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg, #2563eb, #0ea5e9);
  font-weight: 700;
}

.brand p,
.sidebar-footer p {
  margin: 0.2rem 0 0;
  color: #94a3b8;
}

.nav {
  display: grid;
  gap: 0.45rem;
  margin: 2rem 0;
}

.nav a {
  padding: 0.85rem 1rem;
  border-radius: 14px;
  color: #cbd5e1;
  background: transparent;
}

.nav a.active {
  background: rgba(37, 99, 235, 0.2);
  color: #eff6ff;
}

.workspace {
  padding: 1.5rem;
}

.workspace-header,
.panel-header,
.hero-card,
.customer-card-header,
.detail-grid {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.workspace-header {
  align-items: center;
  margin-bottom: 1.5rem;
}

.eyebrow {
  margin: 0 0 0.35rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.74rem;
  color: #7dd3fc;
}

.hero-card,
.panel,
.customer-card {
  padding: 1.25rem;
  border-radius: 22px;
}

.stats-grid,
.customer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.stat-card strong {
  display: block;
  margin: 0.35rem 0;
  font-size: 2rem;
  color: #f8fafc;
}

.chip-row,
.recent-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.chip,
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border-radius: 999px;
  padding: 0.45rem 0.8rem;
  background: rgba(30, 41, 59, 0.8);
  color: #cbd5e1;
  font-size: 0.9rem;
}

.status-active {
  background: rgba(16, 185, 129, 0.18);
  color: #a7f3d0;
}

.status-prospect {
  background: rgba(250, 204, 21, 0.18);
  color: #fde68a;
}

.recent-item {
  display: grid;
  gap: 0.2rem;
  padding: 1rem;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.88);
}

.customer-card {
  display: grid;
  gap: 1rem;
}

.customer-card dl,
.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.9rem;
  margin: 0;
}

.customer-card dt,
.detail-grid dt {
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94a3b8;
}

.customer-card dd,
.detail-grid dd {
  margin: 0.2rem 0 0;
  color: #e2e8f0;
}

@media (max-width: 900px) {
  .app-shell {
    grid-template-columns: 1fr;
  }

  .sidebar {
    border-right: 0;
    border-bottom: 1px solid rgba(148, 163, 184, 0.14);
  }

  .auth-card-header,
  .workspace-header-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .language-selector {
    justify-content: space-between;
    width: 100%;
  }
}
`), { type: "source", language: "css" })
        ];
    }

    buildProductionOverlay({ projectName, modules, entities, services, apis, languageContext = null }) {
        const moduleList = modules.length ? modules : ["Authentication", "Dashboard", "Customers", "Reporting"];
        const entityList = entities.length ? entities : ["User", "Customer", "Activity"];
        const serviceList = services.length ? services : ["Authentication Service", "Customer Service"];
        const apiList = apis.length ? apis : ["/auth/login", "/auth/me", "/customers", "/crm/summary"];
        const localization = buildLocalizationBundle(languageContext);
        const defaultLocale = localization.locale;
        const htmlLang = defaultLocale.split("-")[0] || "en";

        return [
            makeFile("backend/requirements.txt", [
                "fastapi>=0.115.0",
                "uvicorn[standard]>=0.30.0",
                "sqlalchemy>=2.0.0",
                "python-dotenv>=1.0.1",
                "alembic>=1.13.2",
                "psycopg[binary]>=3.2.1",
                "python-json-logger>=2.0.7",
                "pytest>=8.3.2",
                "httpx>=0.27.0"
            ].join("\n") + "\n", { type: "configuration", language: "text" }),
            makeFile("backend/.env.example", [
                `APP_NAME=${projectName}`,
                "APP_ENV=production",
                "BUILD_VERSION=5.0.0",
                "DATABASE_URL=postgresql+psycopg://postgres:postgres@db:5432/enterprise_crm",
                "SECRET_KEY=replace-with-a-strong-secret",
                "ACCESS_TOKEN_EXPIRE_MINUTES=480",
                "ADMIN_EMAIL=admin@annexe.ai",
                "ADMIN_PASSWORD=Admin123!",
                "CORS_ORIGINS=https://localhost,https://127.0.0.1",
                "LOG_LEVEL=INFO",
                `DEFAULT_LOCALE=${defaultLocale}`,
                `SUPPORTED_LOCALES=${localization.supportedLocales.join(",")}`,
                `DEFAULT_LANGUAGE=${localization.language}`
            ].join("\n") + "\n", { type: "configuration", language: "env" }),
            makeFile("frontend/.env.example", [
                "VITE_API_URL=/api",
                `VITE_APP_NAME=${projectName}`,
                `VITE_DEFAULT_LOCALE=${defaultLocale}`,
                `VITE_SUPPORTED_LOCALES=${localization.supportedLocales.join(",")}`
            ].join("\n") + "\n", { type: "configuration", language: "env" }),
            makeFile("backend/app/version.py", block(`
from .config import settings


BUILD_VERSION = settings.build_version
`), { type: "source", language: "python" }),
            makeFile("backend/app/logging_config.py", block(`
import json
import logging
import time


class JsonFormatter(logging.Formatter):
    def format(self, record):
        payload = {
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S%z", time.localtime(record.created))
        }
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(payload)


def configure_logging(level: str = "INFO"):
    handler = logging.StreamHandler()
    handler.setFormatter(JsonFormatter())
    logging.basicConfig(level=getattr(logging, level.upper(), logging.INFO), handlers=[handler], force=True)
    return logging.getLogger("annexe")
`), { type: "source", language: "python" }),
            makeFile("backend/app/config.py", block(`
import os


class Settings:
    app_name = os.getenv("APP_NAME", "${projectName}")
    app_env = os.getenv("APP_ENV", "development")
    build_version = os.getenv("BUILD_VERSION", "5.0.0")
    database_url = os.getenv("DATABASE_URL", "sqlite:///./crm.db")
    secret_key = os.getenv("SECRET_KEY", "change-me-in-production")
    access_token_expire_minutes = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))
    admin_email = os.getenv("ADMIN_EMAIL", "admin@annexe.ai")
    admin_password = os.getenv("ADMIN_PASSWORD", "Admin123!")
    log_level = os.getenv("LOG_LEVEL", "INFO")
    default_locale = os.getenv("DEFAULT_LOCALE", "${defaultLocale}")
    supported_locales = [
        locale.strip()
        for locale in os.getenv("SUPPORTED_LOCALES", "${localization.supportedLocales.join(",")}").split(",")
        if locale.strip()
    ]
    default_language = os.getenv("DEFAULT_LANGUAGE", "${localization.language}")
    cors_origins = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
        if origin.strip()
    ]


settings = Settings()
`), { type: "source", language: "python" }),
            makeFile("backend/app/localization.py", block(`
from __future__ import annotations

from typing import Any

from fastapi import Request

from .config import settings


SUPPORTED_LOCALES = ${JSON.stringify(localization.backendMessages.supportedLocales)}
RTL_LOCALES = ${JSON.stringify(localization.rtlLocales)}
DEFAULT_LOCALE = settings.default_locale
DEFAULT_LANGUAGE = settings.default_language
TRANSLATIONS = ${JSON.stringify(localization.backendMessages.translations, null, 2)}


def normalize_locale(locale: str | None):
    if not locale:
        return None
    return str(locale).strip().replace("_", "-")


def parse_accept_language(header_value: str | None):
    if not header_value:
        return []
    matches = []
    for part in header_value.split(","):
        token = part.split(";", 1)[0].strip()
        if token:
            matches.append(token)
    return matches


def resolve_locale(locale: str | None = None, accept_language: str | None = None):
    candidates = [normalize_locale(locale)]
    candidates.extend(normalize_locale(value) for value in parse_accept_language(accept_language))
    candidates.extend([normalize_locale(DEFAULT_LOCALE), "en-US"])

    for candidate in candidates:
        if candidate and candidate in SUPPORTED_LOCALES:
            return candidate
        if candidate and "-" in candidate:
            language_prefix = candidate.split("-", 1)[0]
            for supported_locale in SUPPORTED_LOCALES:
                if supported_locale.startswith(language_prefix):
                    return supported_locale

    return "en-US"


def resolve_request_locale(request: Request | None = None, locale: str | None = None):
    if request is None:
        return resolve_locale(locale)
    header_locale = request.headers.get("X-Locale") or locale
    accept_language = request.headers.get("Accept-Language")
    return resolve_locale(header_locale, accept_language)


def _resolve_path(source: dict[str, Any], key_path: str):
    current: Any = source
    for key in key_path.split("."):
        if not isinstance(current, dict):
            return None
        current = current.get(key)
    return current


def _format_message(message: Any, values: dict[str, Any] | None = None):
    if not isinstance(message, str):
        return message
    result = message
    for key, value in (values or {}).items():
        result = result.replace("{" + str(key) + "}", str(value))
    return result


def translate_message(key: str, locale: str | None = None, default: str | None = None, **values):
    active_locale = resolve_locale(locale)
    message = _resolve_path(TRANSLATIONS.get(active_locale, {}), key)
    if message is None:
        message = _resolve_path(TRANSLATIONS.get("en-US", {}), key)
    if message is None:
        message = default or key
    return _format_message(message, values)


def get_locale_context(locale: str | None = None, request: Request | None = None):
    active_locale = resolve_request_locale(request, locale)
    active_translations = TRANSLATIONS.get(active_locale, TRANSLATIONS.get("en-US", {}))
    return {
        "language": active_translations.get("language", DEFAULT_LANGUAGE),
        "locale": active_locale,
        "supported_locales": SUPPORTED_LOCALES,
        "default_locale": DEFAULT_LOCALE,
        "is_rtl": active_locale in RTL_LOCALES,
        "translations": active_translations,
        "error_messages": active_translations.get("errors", {})
    }


def get_error_message(key: str, locale: str | None = None):
    return translate_message(key, locale)
`), { type: "source", language: "python" }),
            makeFile("backend/app/database.py", block(`
from contextlib import contextmanager

from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import StaticPool

from .config import settings


Base = declarative_base()


def _create_engine():
    database_url = settings.database_url
    if database_url.startswith("sqlite"):
        return create_engine(
            "sqlite:///:memory:",
            future=True,
            echo=False,
            connect_args={"check_same_thread": False},
            poolclass=StaticPool
        )

    return create_engine(
        database_url,
        future=True,
        echo=False,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10
    )


engine = _create_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)


def init_db():
    from .models import crm  # noqa: F401

    Base.metadata.create_all(bind=engine)


def database_status() -> dict:
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {
            "status": "ok",
            "driver": engine.url.drivername
        }
    except Exception as exc:  # pragma: no cover - startup/health guard
        return {
            "status": "degraded",
            "driver": engine.url.drivername,
            "error": str(exc)
        }


@contextmanager
def session_scope():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def get_db():
    with session_scope() as db:
        yield db
`), { type: "source", language: "python" }),
            makeFile("backend/app/routers/health.py", block(`
from fastapi import APIRouter, Request

from ..config import settings
from ..database import database_status
from ..localization import get_locale_context
from ..version import BUILD_VERSION

router = APIRouter(tags=["system"])


@router.get("/health")
def health(request: Request):
    locale_context = get_locale_context(request=request)
    return {
        "status": "ok",
        "project": settings.app_name,
        "environment": settings.app_env,
        "version": BUILD_VERSION,
        "locale": locale_context["locale"],
        "locale_context": locale_context,
        "supported_locales": settings.supported_locales,
        "database": database_status()
    }


@router.get("/ready")
def ready():
    db_status = database_status()
    return {
        "status": "ready" if db_status.get("status") == "ok" else "degraded",
        "database": db_status,
        "version": BUILD_VERSION
    }


@router.get("/version")
def version():
    return {
        "project": settings.app_name,
        "version": BUILD_VERSION,
        "build_version": BUILD_VERSION,
        "locale": settings.default_locale
    }
`), { type: "source", language: "python" }),
            makeFile("backend/app/main.py", block(`
import logging
import time

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings
from .database import init_db
from .logging_config import configure_logging
from .localization import get_locale_context, resolve_request_locale, translate_message
from .routers import auth_router, crm_router, customers_router, health_router
from .services.crm_service import CRMService
from .version import BUILD_VERSION


logger = configure_logging(settings.log_level)


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name, version=BUILD_VERSION)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins or ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"]
    )

    @app.middleware("http")
    async def request_logging(request: Request, call_next):
        started = time.perf_counter()
        try:
            response = await call_next(request)
        except Exception:
            logger.exception("request_failed", extra={"path": request.url.path, "method": request.method})
            raise

        elapsed_ms = round((time.perf_counter() - started) * 1000, 2)
        logger.info(
            "request_completed",
            extra={
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_ms": elapsed_ms
            }
        )
        response.headers["X-Response-Time-Ms"] = str(elapsed_ms)
        return response

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(request: Request, exc: RequestValidationError):
        locale = resolve_request_locale(request)
        logger.warning("validation_error", extra={"path": request.url.path, "errors": exc.errors()})
        return JSONResponse(status_code=422, content={
            "detail": translate_message("errors.general.validation", locale),
            "errors": exc.errors()
        })

    @app.on_event("startup")
    def bootstrap_database():
        logger.info("startup", extra={"project": settings.app_name, "version": BUILD_VERSION})
        init_db()
        from .database import session_scope

        service = CRMService()
        with session_scope() as db:
            service.bootstrap(db)

    app.include_router(health_router)
    app.include_router(auth_router)
    app.include_router(customers_router)
    app.include_router(crm_router)

    @app.get("/")
    def root(request: Request):
        return {
            "project": settings.app_name,
            "status": "ready",
            "version": BUILD_VERSION,
            "locale": get_locale_context(request=request)["locale"],
            "locale_context": get_locale_context(request=request)
        }

    return app


app = create_app()
`), { type: "source", language: "python" }),
            makeFile("backend/alembic.ini", block(`
[alembic]
script_location = alembic
prepend_sys_path = .
sqlalchemy.url = postgresql+psycopg://postgres:postgres@db:5432/enterprise_crm

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
`), { type: "configuration", language: "ini" }),
            makeFile("backend/alembic/env.py", block(`
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from app.config import settings
from app.database import Base
from app.models import crm  # noqa: F401


config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def run_migrations_offline():
    context.configure(
        url=settings.database_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    connectable = engine_from_config(
        {"sqlalchemy.url": settings.database_url},
        prefix="",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
`), { type: "source", language: "python" }),
            makeFile("backend/alembic/versions/0001_initial.py", block(`
"""initial schema

Revision ID: 0001_initial
Revises:
Create Date: 2026-08-07
"""

from alembic import op
import sqlalchemy as sa


revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False, unique=True),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=64), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), nullable=False)
    )
    op.create_table(
        "customers",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=True, unique=True),
        sa.Column("company", sa.String(length=255), nullable=True),
        sa.Column("status", sa.String(length=64), nullable=False),
        sa.Column("phone", sa.String(length=64), nullable=True),
        sa.Column("owner", sa.String(length=255), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False)
    )


def downgrade():
    op.drop_table("customers")
    op.drop_table("users")
`), { type: "source", language: "python" }),
            makeFile("backend/scripts/migrate.py", block(`
from app.database import init_db

try:
    from alembic import command
    from alembic.config import Config
except ImportError:
    command = None
    Config = None


def main():
    if command and Config:
        config = Config("alembic.ini")
        command.upgrade(config, "head")
    else:
        init_db()


if __name__ == "__main__":
    main()
`), { type: "source", language: "python" }),
            makeFile("backend/pytest.py", block(`
import sys
import unittest


def main():
    loader = unittest.defaultTestLoader
    suite = loader.discover("tests")
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    raise SystemExit(0 if result.wasSuccessful() else 1)


if __name__ == "__main__":
    main()
`), { type: "source", language: "python" }),
            makeFile("backend/tests/test_health.py", block(`
import unittest

from fastapi.testclient import TestClient

from app.database import init_db, session_scope
from app.main import app
from app.services.crm_service import CRMService


class HealthTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        with session_scope() as db:
            CRMService().bootstrap(db)

    def setUp(self):
        self.client = TestClient(app)

    def test_health(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "ok")

    def test_ready(self):
        response = self.client.get("/ready")
        self.assertEqual(response.status_code, 200)
        self.assertIn("database", response.json())

    def test_version(self):
        response = self.client.get("/version")
        self.assertEqual(response.status_code, 200)
        self.assertIn("version", response.json())
`), { type: "source", language: "python" }),
            makeFile("backend/tests/test_auth.py", block(`
import unittest

from fastapi.testclient import TestClient

from app.database import init_db, session_scope
from app.main import app
from app.services.crm_service import CRMService


class AuthTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        with session_scope() as db:
            CRMService().bootstrap(db)

    def setUp(self):
        self.client = TestClient(app)

    def test_login_and_me(self):
        login = self.client.post("/auth/login", json={"email": "admin@annexe.ai", "password": "Admin123!"})
        self.assertEqual(login.status_code, 200)
        token = login.json()["access_token"]
        me = self.client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(me.status_code, 200)
        self.assertEqual(me.json()["email"], "admin@annexe.ai")
`), { type: "source", language: "python" }),
            makeFile("backend/tests/test_customers.py", block(`
import unittest

from fastapi.testclient import TestClient

from app.database import init_db, session_scope
from app.main import app
from app.services.crm_service import CRMService


class CustomerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        with session_scope() as db:
            CRMService().bootstrap(db)

    def setUp(self):
        self.client = TestClient(app)
        login = self.client.post("/auth/login", json={"email": "admin@annexe.ai", "password": "Admin123!"})
        self.token = login.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}

    def test_list_customers(self):
        response = self.client.get("/customers", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(len(response.json()), 3)

    def test_get_customer(self):
        response = self.client.get("/customers/1", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["id"], 1)
`), { type: "source", language: "python" }),
            makeFile("frontend/package.json", JSON.stringify({
                name: projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                private: true,
                type: "module",
                scripts: {
                    dev: "vite",
                    build: "vite build",
                    preview: "vite preview",
                    check: "node scripts/check.mjs",
                    smoke: "node tests/smoke.mjs"
                },
                dependencies: {
                    react: "^18.3.1",
                    "react-dom": "^18.3.1",
                    "react-router-dom": "^6.26.2"
                },
                devDependencies: {
                    "@vitejs/plugin-react": "^4.3.1",
                    vite: "^5.4.2"
                }
            }, null, 2) + "\n", { type: "configuration", language: "json" }),
            makeFile("frontend/Dockerfile", block(`
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`), { type: "configuration", language: "dockerfile" }),
            makeFile("backend/Dockerfile", block(`
FROM python:3.12-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
`), { type: "configuration", language: "dockerfile" }),
            makeFile("docker-compose.yml", block(`
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: enterprise_crm
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d enterprise_crm"]
      interval: 10s
      timeout: 5s
      retries: 10

  backend:
    build:
      context: ./backend
    environment:
      APP_ENV: production
      DATABASE_URL: postgresql+psycopg://postgres:postgres@db:5432/enterprise_crm
      SECRET_KEY: replace-with-a-strong-secret
      BUILD_VERSION: 5.0.0
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "8000:8000"

  frontend:
    build:
      context: ./frontend
    environment:
      VITE_API_URL: /api
    depends_on:
      - backend
    ports:
      - "3000:80"

  nginx:
    image: nginx:1.27-alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - backend
      - frontend
    ports:
      - "80:80"
`), { type: "configuration", language: "yaml" }),
            makeFile("nginx.conf", block(`
worker_processes auto;

events {
  worker_connections 1024;
}

http {
  include       mime.types;
  default_type  application/octet-stream;
  sendfile      on;
  gzip          on;
  gzip_types    text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

  upstream backend_upstream {
    server backend:8000;
  }

  upstream frontend_upstream {
    server frontend:80;
  }

  server {
    listen 80;
    server_name _;

    location /api/ {
      proxy_pass http://backend_upstream/;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
      proxy_pass http://frontend_upstream;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_cache_valid 200 10m;
    }
  }
}
`), { type: "configuration", language: "nginx" }),
            makeFile(".dockerignore", block(`
.git
node_modules
frontend/node_modules
frontend/dist
backend/__pycache__
backend/app/__pycache__
backend/tests/__pycache__
*.pyc
*.pyo
.env
`), { type: "configuration", language: "text" }),
            makeFile(".env.example", block(`
APP_NAME=${projectName}
APP_ENV=production
BUILD_VERSION=5.0.0
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/enterprise_crm
SECRET_KEY=replace-with-a-strong-secret
ACCESS_TOKEN_EXPIRE_MINUTES=480
ADMIN_EMAIL=admin@annexe.ai
ADMIN_PASSWORD=Admin123!
VITE_API_URL=/api
`), { type: "configuration", language: "env" }),
            makeFile(".github/workflows/ci.yml", block(`
name: ci

on:
  push:
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: enterprise_crm
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432
        options: >-
          --health-cmd "pg_isready -U postgres -d enterprise_crm"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 10
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - name: Generate CRM
        run: node generate-enterprise-crm.js
      - name: Compile backend
        run: python -m compileall backend
        working-directory: workspace/enterprise-crm
      - name: Run backend tests
        run: python -m pytest
        working-directory: workspace/enterprise-crm/backend
      - name: Install frontend
        run: npm install
        working-directory: workspace/enterprise-crm/frontend
      - name: Build frontend
        run: npm run build
        working-directory: workspace/enterprise-crm/frontend
      - name: Run smoke tests
        run: npm run smoke
        working-directory: workspace/enterprise-crm/frontend
      - name: Docker compose config
        run: docker compose config
        working-directory: workspace/enterprise-crm
      - name: Build docker images
        run: docker compose build
        working-directory: workspace/enterprise-crm
`), { type: "configuration", language: "yaml" }),
            makeFile("frontend/tests/smoke.mjs", block(`
import fs from "fs";
import path from "path";

const required = [
  "dist/index.html",
  "dist/assets"
];

for (const item of required) {
  if (!fs.existsSync(path.join(process.cwd(), item))) {
    throw new Error(\`Missing build artifact: \${item}\`);
  }
}

console.log("Frontend smoke tests passed.");
`), { type: "source", language: "javascript" })
        ];
    }

    composeArtifacts(manifest) {
        const blueprint = manifest.blueprint ?? {};
        const languageContext = resolveLanguageContext(manifest, blueprint);
        const projectName =
            blueprint.metadata?.projectName ??
            manifest.project?.name ??
            manifest.projectId ??
            "Enterprise CRM";

        const modules = blueprint.businessModules?.modules ?? blueprint.modules ?? [];
        const entities = blueprint.businessModules?.entities ?? blueprint.entities ?? [];
        const services = blueprint.businessModules?.services ?? blueprint.services ?? [];
        const apis = blueprint.businessModules?.apis ?? blueprint.apis ?? [];
        const capabilities = blueprint.applicationAssembly?.capabilities ?? blueprint.capabilities ?? [];

        const map = new Map();
        const add = file => {
            if (!file?.path) return;
            map.set(normalizePath(file.path), {
                ...file,
                path: normalizePath(file.path)
            });
        };

        for (const file of this.buildRootFiles({ projectName, blueprint, languageContext })) add(file);
        for (const file of this.buildBackendTemplate({ projectName, modules, entities, services, apis, languageContext })) add(file);
        for (const file of this.buildFrontendTemplateV2({ projectName, modules, languageContext })) add(file);
        for (const file of this.buildProductionOverlay({
            projectName,
            modules,
            entities,
            services,
            apis,
            languageContext
        })) add(file);
        for (const file of this.buildCapabilityFiles({ projectName, capabilities })) add(file);
        for (const file of blueprint.files ?? []) add(file);
        for (const file of manifest.artifacts ?? []) add(file);

        return Array.from(map.values());
    }

    write(manifest) {
        if (!manifest)
            throw new Error("BuildManifest is required.");

        const report = new WriteReport({
            manifestId: manifest.manifestId,
            projectId: manifest.projectId
        });

        const projectRoot = path.join(this.workspaceRoot, manifest.projectId);

        if (!fs.existsSync(projectRoot)) {
            fs.mkdirSync(projectRoot, { recursive: true });
            report.addDirectory(projectRoot);
        }

        const artifacts = this.composeArtifacts(manifest);

        for (const file of artifacts) {
            const outputPath = path.join(projectRoot, file.path);
            const directory = path.dirname(outputPath);

            if (!fs.existsSync(directory)) {
                fs.mkdirSync(directory, { recursive: true });
                report.addDirectory(directory);
            }

            if (fs.existsSync(outputPath) && file.overwrite === false) {
                report.addSkipped(outputPath);
                continue;
            }

            if (fs.existsSync(outputPath) && file.overwrite === true) {
                report.addOverwritten(outputPath);
            }

            try {
                fs.writeFileSync(outputPath, file.content ?? "", {
                    encoding: file.encoding ?? "utf8"
                });
                report.addWritten(outputPath);
            }
            catch (error) {
                report.addError(outputPath, error);
            }
        }

        report.complete();
        return report;
    }

}
