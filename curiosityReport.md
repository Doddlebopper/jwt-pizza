Curiosity Report: Kubernetes

Introduction

I chose Kubernetes as my Curiosity Report because I had an internship this last summer where I worked as basically a junior DevOps Engineer, and I did a lot of work with Docker containers as a form of application testing. My boss briefly brought up the uses of cloud based
application testing through kubernetes and I had mostly forgotten about it until this class brought it up during the dockerization portion.  

About

-Open source system for automating deployment, scaling, and management of containerized applications.

Key Kubernetes Concepts

Pods:
  -The smallest form of container that Kubernetes manages.
  -Can contain one or multiple containers that must be scheduled together.
  -Pods can wrap containers with a shared network namespace, shared storage volumes, and metadata.

Services:
  -Pods are considered ephemeral, or ever changing.
  -Constantly changing IP addresses.
  -Services like ClusterIP and LoadBalancer allow you to create stable IP addresses and DNS names that always point to the correct pods.

Nodes:
  -Virtual Machine that runs in two key processes.
  - 1.) Kubelet which talks to the Kubernetes control plane, and ensures Pod containers are running
  - 2.) kube-proxy which handles virtual networking for Services.

Cluster:
  -Clusters represent a combination of all nodes, and the control plane.
  -Contains the API Server which acts as the entry point for all commands.
  -Kubernetes uses clusters to essentially turn your whole fleet of machines into one unified working network.

Why choose Kubernetes?

-One of the most important differences between docker containers and kubernetes containers is that docker continers will die out, and stay dead until you detect it and restart it. Similarly if a docker server dies out, the containers being run on said server will die.

-Kubernetes provides an automatic self-recovery system wherein if a pod crashes, or dies out, it will be automatically restarted and prevent the need for any form of manual fix.

-Kubernetes also provides the ability to handle traffic spikes by allowing pods to autoscale through Kubernetes' Horizontal Pod Autoscaler (HPA) which scales based off of your machines CPU and memory metrics.

Why not choose Kubernetes?

-Kubernetes is very powerful, but unfortunately it is quite complex.

-Kubernetes was made for large applications and companies that expect large amounts of input and traffic, so Kubernetes isn't, and probably shouldn't be, used for smaller single-server applications.

-Kubernetes requires a lot of heavy operational overhead that might become a burden instead of a benefit to companies that don't have dedicated QA/DevOps engineering support.

-Running multiple pods, with load balancers, can change an overall total of 5-10$/month docker container based app, into a 80-150$/month app running through Kubernetes.

Personal Takeaways

-The company that I interned for over the summer was, in my opinion, not big enough to have to worry about the overall benefits of kubernetes for their applications. I am glad I was introduced to it, but I believe that the best way for me to learn more about kubernetes is
possibly creating a personal project that implements a very basic form of containerization through kubernetes.

-Kubernetes seems like a very important technology that I would need to learn more about if I were to choose to pursue a future in the Develeper Operations world, but mastering the concepts of docker containerization would be the most opportune for me starting out in junior level positions.
