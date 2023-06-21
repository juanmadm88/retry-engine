FROM hub.fif.tech/devops-tools-payments/payments-pm2:16.13.1-alpine3.12-r1

COPY --chown=node:node . .

ARG BUILDNUMBER

ENV BUILDNUMBER $BUILDNUMBER

#EXPOSE 3000

CMD ["/bin/sh", "/startup.sh"]