# Alexa-Skill-Lavaplatos
"Lavaplatos Estado", una Skill sencilla para Amazon Alexa que usa DynamoDB, publicada en https://www.amazon.es/Javier-Campos-Lavaplatos-estado/dp/B07MXGNVRL

Código fuente traducido a castellano y con comentarios "extra" para fines educativos.

Siénte libre para utilizar este proyecto como punto de partida para crear tu Skill con persistencia de datos en DynamoDB.

## Configuración
Para reutilizar esta skill, recuerda hacer estos cambios:
1. En el fichero 'package.json', editar 'name', 'description' y 'author'.
2. En el fichero del modelo (modelo/es-ES.json), editar 'invocationName'.
3. En el fichero 'index.js', editar las constantes que aparecen al inicio.
4. En el fichero 'index.js', editar el nombre de la tabla DynamoDB.
5. Crea tu tabla DynamoDB (https://console.aws.amazon.com/dynamodb). En este ejemplo, se ha creado una tabla con "Primary partition key" = userId (String).
6. **IMPORTANTE. Seguridad:**
    7.1. Crea una nueva política de seguridad (https://console.aws.amazon.com/iam/home#/policies), que tenga acceso limitado a tu tabla DynamoDB. Concretamente para este ejemplo, hay que dar estos permisos en la nueva política:
```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "dynamodb:PutItem",
                "dynamodb:DeleteItem",
                "dynamodb:GetItem",
                "dynamodb:Scan",
                "dynamodb:Query",
                "dynamodb:UpdateItem"
            ],
            "Resource": "<ARN de tu tabla DynamoDB>"
        }
    ]
}
```

    6.2. Añade la política recién creada al rol de ejecución de la función lambda de tu skill (https://console.aws.amazon.com/iam/home?#/roles).

## Cómo usar Dynamola, para acceso fácil a DynamoDB:

1. Añadir módulo al proyecto: npm install dynamola

2. Usar constructor así:

```
const Dynamola = require('dynamola');
let myDb = new Dynamola("nombre-tabla-en-dynamodb", "nombre-primary-key-en-dynamodb", null);

myDb.getItem(userID).then((data) => {
    if(!data){
        // item no existe
    }
    else {
        // item devuelto OK
    }
})
.catch((err) => {
    // error al acceder a dynamodb
});
```

## Otras consideraciones

1. Al configurar tu función Lambda en AWS, recuerda habilitar que solo pueda ser invocada por el APPLICATION_ID de tu Skill. Esde ID lo obtendrás en https://developer.amazon.com/alexa/console/ask
2. Los datos que se están almacenando no son críticos (se guarda solo la cadena de texto "limpio"/"sucio" de cada usuario), por eso para identificar al usuario se utiliza el UserId que genera automáticamente Amazon cuando cada usuario instala tu Skill. Pero es importante entender que dicho UserId cambiará si un usuario borra tu Skill y la vuelve a instalar. Por tanto, **si almacenas información crítica o si quieres que los datos perduren incluso después de que un usuario borre y reinstale tu skill, entonces tendrás que utilizar otro sistema de autenticación más seguro**.
3. Para generar obtener los módulos node necesarios, ejecuta "npm install" en la carpeta ./lambda.
