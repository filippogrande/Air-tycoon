# Migrazione 010: Aggiornamento autenticazione utenti via email

## Scopo

Aggiorna la tabella `users` per supportare l'autenticazione tramite email invece di username, allineando lo schema del database con l'implementazione corrente del sistema di autenticazione.

## Esecuzione Automatica

✅ **Questa migrazione viene eseguita automaticamente all'avvio del server**

Quando esegui `pm2 restart air-tycoon`, il server:

1. Controlla le migrazioni pendenti
2. Esegue automaticamente la migrazione 010 se non è stata ancora applicata
3. Registra l'esecuzione nel sistema di tracking migrazioni
4. Avvia normalmente il servizio

## Modifiche

### Tabella `users`

- ✅ **email** diventa NOT NULL e UNIQUE (chiave di identificazione principale)
- ✅ **username** diventa opzionale (solo per display, non più per auth)
- ✅ Aggiunto indice su email per performance
- ✅ Aggiornati i commenti per chiarire l'uso dei campi

## Impatto

- **Breaking Change**: ❌ No - retrocompatibile
- **Richiede restart**: ❌ No
- **Richiede rebuild cache**: ❌ No

## Validazione

Dopo l'applicazione della migrazione, verificare:

1. Non ci sono email duplicate
2. Tutti gli utenti hanno un email valido
3. L'autenticazione funziona correttamente

## Note

- Gli username esistenti vengono mantenuti per compatibilità
- Gli utenti senza email ricevono un placeholder `@localhost`
- Il sistema di autenticazione ora usa solo l'email come identificatore

## Rollback

Per fare rollback (sconsigliato):

```sql
ALTER TABLE users
    ALTER COLUMN email DROP NOT NULL,
    ALTER COLUMN username SET NOT NULL,
    DROP CONSTRAINT users_email_key,
    ADD CONSTRAINT users_username_key UNIQUE (username);
```
