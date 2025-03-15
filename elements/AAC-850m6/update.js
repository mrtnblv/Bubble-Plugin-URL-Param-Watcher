function(instance, properties, context) {

    function watchURLChanges(paramName, callback) {
        let lastParams = new URLSearchParams(window.location.search);

        function checkChange() {
            const currentParams = new URLSearchParams(window.location.search);
            const oldValue = lastParams.get(paramName);
            const newValue = currentParams.get(paramName);

            if (oldValue !== newValue) {
                lastParams = currentParams;
                callback(oldValue, newValue);  // Passer oldValue et newValue au callback
            }
        }

        // Écoute les retours en arrière et avant dans l'historique
        window.addEventListener("popstate", checkChange);

        // Interception de pushState et replaceState
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function() {
            originalPushState.apply(this, arguments);
            checkChange();
        };

        history.replaceState = function() {
            originalReplaceState.apply(this, arguments);
            checkChange();
        };

        // MutationObserver pour détecter les changements d'URL dans le DOM
        const observer = new MutationObserver(checkChange);
        observer.observe(document, { subtree: true, childList: true });

        // Retourne une fonction pour stopper l'observation si besoin
        return () => observer.disconnect();
    }

    // Exécuter la surveillance sur le paramètre "page"
    watchURLChanges(properties.url_param, function(oldValue, newValue) {
        instance.publishState('previous_value', oldValue);
        instance.publishState('current_value', newValue);
        instance.triggerEvent("param_change");
    });

}
