curl https://raw.githubusercontent.com/kubernetes/helm/master/scripts/get > get_helm.sh
chmod 700 get_helm.sh
./get_helm.sh
sleep 5
helm init
sleep 30
helm repo add stable https://kubernetes-charts.storage.googleapis.com
helm install --namespace=kube-system --name chaoskube stable/chaoskube --set dryRun=false --set interval=1m --set namespaces=default
sleep 30
POD=$(kubectl get pods -l app=chaoskube-chaoskube --namespace kube-system --output name)
kubectl logs -f $POD --namespace=kube-system


