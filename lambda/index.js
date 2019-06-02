/* eslint-disable  func-names */
/* eslint-disable  no-console */

/* 1. Cargamos las dependencias. */
const Alexa = require('ask-sdk-core');
const dynamola = require('dynamola');
let myDb = new dynamola("<AQUÍ NOMBRE DE TU TABLA DYNAMODB>", "userId", null);

/* 2. Constantes */
const skillBuilder = Alexa.SkillBuilders.custom();
const HELP_MESSAGE = 'Esta skill recuerda el estado actual de tu lavaplatos: limpio o sucio. Utilízala para no tener que abrir tu lavaplatos para comprobarlo. Cada vez que enciendas o recojas tu electrodoméstico, puedes guardar el nuevo estado (limpio o sucio) en la skill. Para guardar un nuevo estado simplemente di "limpio" o "sucio". Para salir di "salir".';
const HELP_REPROMPT = HELP_MESSAGE;
const STOP_MESSAGE = '<say-as interpret-as="interjection">Hasta luego</say-as>';
const NO_ENTIENDO_REPITE_POR_FAVOR = '<say-as interpret-as="interjection">¿cómorr?</say-as>. Lo siento, no te he entendido. Repite por favor.';


/* 3. Manejadores */
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest' || 
      (handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'estadoActualIntent');
  },
  async handle(handlerInput) {
    const {responseBuilder } = handlerInput;
    const userID = handlerInput.requestEnvelope.context.System.user.userId; 
    
    return myDb.getItem(userID)
      .then((data) => {
        var speechText = "";
        if(!data){
          speechText = "Aun no sé si tu lavaplatos está limpio o sucio. Dime 'limpio' o 'sucio' y lo recordaré. Dime por ejemplo: el lavaplatos está sucio. También puedes decir 'salir' o 'ayuda'.";
        }
        else {
          let limpioArray = ["relusiente", "brillante", "reluciente", "limpita", "limpito", "limpia"];
          var opuesto = (limpioArray.includes(data.status)) ? "sucio" : "limpio";
          speechText = "El lavaplatos está " + data.status + ". Si quieres que guarde '" + opuesto + "', dímelo o dime salir.";
        }
        return responseBuilder
          .speak(speechText)
          .reprompt(speechText)
          .getResponse();
      })
      .catch((err) => {
        const speechText = "Error al intentar recordar el estado de tu lavaplatos." + err;
        return responseBuilder
          .speak(speechText)
          .reprompt(speechText)
          .getResponse();
      });
  }
};


const RespuestaHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'cambiarEstadoIntent';
  },
  handle(handlerInput) {    
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    const itemSlot = handlerInput.requestEnvelope.request.intent.slots.estado;

    if (itemSlot && itemSlot.value) {
      
      const {responseBuilder } = handlerInput;
      
      const userID = handlerInput.requestEnvelope.context.System.user.userId;
      const slots = handlerInput.requestEnvelope.request.intent.slots;
      const nuevoEstadoLavaplatos = slots.estado.value;
      
      return myDb.deleteItem(userID)
      .then((data) => {
        return myDb.addItem(userID, {"status": nuevoEstadoLavaplatos})
            .then((data) => {
              const speechText = `¡Guardado! El lavaplatos ahora está ` + nuevoEstadoLavaplatos + ". ¡Hasta luego!";
              return responseBuilder
                .speak(speechText)
                .withShouldEndSession(true)
                .getResponse();
            })
            .catch((err) => {
              console.log("Error guardando el estado. ", err);
              const speechText = "Error guardando. Vuelve a intentarlo." + err;
              return responseBuilder
                .speak(speechText)
                .withShouldEndSession(true)
                .getResponse();
            });
        
      })
      .catch((err) => {
        console.log("Error borrando el estado anterior. ", err);
        const speechText = "Error borrando el estado anterior. Vuelve a intentarlo." + err;
        return responseBuilder
          .speak(speechText)
          .withShouldEndSession(true)
          .getResponse();
      });
    }
  }
};


const HelpHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {    
    return handlerInput.responseBuilder
      .speak(HELP_MESSAGE)
      .reprompt(HELP_REPROMPT)
      .getResponse();
  },
};


const ExitHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent');
  },
  handle(handlerInput) {    
    return handlerInput.responseBuilder
      .speak(STOP_MESSAGE)
      .withShouldEndSession(true)
      .withShouldEndSession(true) /* Para cerrar sesión. */
      .getResponse();
  },
};


const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    console.log("Inside SessionEndedRequestHandler");
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${JSON.stringify(handlerInput.requestEnvelope)}`);
    return handlerInput.responseBuilder.getResponse();
  },
};


const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`); // imprimiremos el error por consola    
    
    return handlerInput.responseBuilder
      .speak(NO_ENTIENDO_REPITE_POR_FAVOR)
      .reprompt(NO_ENTIENDO_REPITE_POR_FAVOR)
      .getResponse();
  },
};


/* 5. Configuración de Lambda */
exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    RespuestaHandler,
    HelpHandler,
    ExitHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();