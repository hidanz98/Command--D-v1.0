# 🔍 Verificar Cadastro - CÓDIGO PRONTO

## Cole este código no Console (F12):

```javascript
// Verificar se o cliente foi cadastrado
fetch('/api/clients/search?email=eduardasasascha37@gmail.com')
  .then(r => r.json())
  .then(data => {
    console.log('═══════════════════════════════════');
    console.log('📋 RESULTADO DA BUSCA');
    console.log('═══════════════════════════════════');
    
    if (data.found) {
      console.log('✅ CLIENTE ENCONTRADO!');
      console.log('ID:', data.client.id);
      console.log('Nome:', data.client.name);
      console.log('Email:', data.client.email);
      console.log('Status:', data.client.status);
      console.log('Tenant ID:', data.client.tenantId);
      console.log('Documentos:', data.client.documentsCount);
      console.log('Criado em:', data.client.createdAt);
    } else {
      console.log('❌ CLIENTE NÃO ENCONTRADO');
      console.log('Email buscado:', data.email);
      console.log('Tenant usado:', data.tenantId);
      
      if (data.debug && data.debug.clientsInOtherTenants) {
        console.log('⚠️ Cliente encontrado em outros tenants:');
        console.log(data.debug.clientsInOtherTenants);
      }
    }
    
    console.log('═══════════════════════════════════');
    return data;
  })
  .catch(err => {
    console.error('❌ ERRO:', err);
  });
```

---

## Ou use este código mais simples:

```javascript
fetch('/api/clients/search?email=eduardasasascha37@gmail.com').then(r => r.json()).then(console.log);
```

---

## Se der erro, tente verificar todos os clientes:

```javascript
fetch('/api/clients/pending')
  .then(r => r.json())
  .then(data => {
    console.log('📋 Clientes pendentes:', data.length);
    const eduarda = data.find(c => c.email === 'eduardasasascha37@gmail.com');
    if (eduarda) {
      console.log('✅ ENCONTRADO!', eduarda);
    } else {
      console.log('❌ Não encontrado na lista de pendentes');
      console.log('Emails encontrados:', data.map(c => c.email));
    }
  });
```

---

## 📝 O Que Fazer:

1. **Cole o primeiro código** no Console
2. **Pressione Enter**
3. **Me mostre o resultado** que aparecer no console

Com isso conseguiremos identificar se o cliente foi criado e por que não aparece nas aprovações!
