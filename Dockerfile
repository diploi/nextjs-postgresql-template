FROM node:20.3.0-slim

# This dockerfile is run by diploi image builder, it will have 
# this template repository as it's base and the actual project
# repository will be mounted in the repository folder.

# Update basic packages
RUN apt-get update && apt-get install -y nano supervisor openssh-server git bash wget curl locales libc6 libstdc++6 python-is-python3 ca-certificates tar

# Install PostgreSQL client
RUN apt-get install -y postgresql-client

# SSH keys and some login related stuff (some work only for prod)
RUN mkdir -p /run/sshd /root/.ssh \
  && chmod 0700 /root/.ssh \
  && ssh-keygen -A \
  && sed -i s/^#PasswordAuthentication\ yes/PasswordAuthentication\ no/ /etc/ssh/sshd_config \
  && sed -i s/root:!/"root:*"/g /etc/shadow \
  # Welcome message
  && echo "Welcome to Diploi!" > /etc/motd \
  # Go to app folder by default
  && echo "cd /app;" >> /root/.bashrc

# Fix LC_ALL: cannot change locale (en_US.UTF-8) error
RUN echo "LC_ALL=en_US.UTF-8" >> /etc/environment && \
  echo "en_US.UTF-8 UTF-8" >> /etc/locale.gen && \
  echo "LANG=en_US.UTF-8" > /etc/locale.conf && \
  locale-gen en_US.UTF-8
  
# Gitconfig secrets and credential helper
RUN ln -s /etc/diploi-git/gitconfig /etc/gitconfig
COPY diploi-credential-helper /usr/local/bin

# Install code server
curl -fsSL https://code-server.dev/install.sh | sh

# Init and run supervisor
COPY diploi-runonce.sh /usr/local/bin/diploi-runonce.sh
COPY supervisord.conf /etc/supervisord.conf
CMD /usr/bin/supervisord -c /etc/supervisord.conf
