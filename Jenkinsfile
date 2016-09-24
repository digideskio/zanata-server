#!/usr/bin/env groovy

// these wrappers don't seem to be built in yet
def void ansicolor(Closure<Void> wrapped) {
  wrap([$class: 'AnsiColorBuildWrapper', 'colorMapName': 'XTerm', 'defaultFg': 1, 'defaultBg': 2]) {
    wrapped()
  }
}
def void xvfb(Closure<Void> wrapped) {
  wrap([$class: 'Xvfb']) {
    wrapped()
  }
}

def void withPorts(Closure<Void> wrapped) {
  def ports = sh(script: 'etc/scripts/allocate-jboss-ports', returnStdout: true)
  withEnv(ports.trim().readLines()) {
    wrapped()
  }
}


timestamps {
  node('Fedora') {
    ansicolor {
      stage('Checkout') {
        // Checkout code from repository
        checkout scm
      }

      stage('Install build tools') {
        // TODO yum install the following
        // Xvfb libaio xorg-x11-server-Xvfb wget unzip git-core
        // https://dl.google.com/linux/direct/google-chrome-stable_current_x86_64.rpm
        // gcc-c++
        // java-devel; set alternatives for java
        // groovy firefox rpm-build docker
        // download chromedriver

        // Note: if next step happens on another node, mvnw might have to download again
        sh "./mvnw --version"
      }

      // TODO build and archive binaries without tests, then in parallel, unarchive and run:
      //   unit tests
      //   arquillian tests
      //   eap, wildfly functional tests
      //   mysql 5.6, functional tests (on wildfly)
      //   and (later) mariadb 10 functional tests (on wildfly)


      stage('Build') {
        sh """./mvnw clean package \
                     --batch-mode \
                     --settings .travis-settings.xml \
                     --update-snapshots \
                     -DstaticAnalysis=false \
                     -Dcheckstyle.skip \
                     -Dchromefirefox \
                     -DskipTests \
                     -DskipFuncTests \
                     -DskipArqTests \
-DexcludeFrontend \
        """
// TODO remove -DexcludeFrontend (just for faster testing)

// TODO build zanata-test-war but don't run functional tests (need to modify zanata-test-war pom)

        archiveArtifacts '**/target/*.war'
//        archiveArtifacts '**/target/*.jar, **/target/*.war'
      }

      stage('stash') {
        stash name: 'workspace', includes: '**'
      }
    }
  }

  stage('Parallel tests') {
    def tasks = [:]
    tasks['Unit tests'] = {
      node('Fedora') {
        ansicolor {
          unstash 'workspace'
          sh """./mvnw surefire:test \
                       -pl zanata-war -am \
                       --batch-mode \
                       --settings .travis-settings.xml \
                       -DstaticAnalysis=true \
                       -Dcheckstyle.skip=false \
                       -Dmaven.test.failure.ignore \
          """
          def testFiles = '**/target/surefire-reports/TEST-*.xml'
          setJUnitPrefix("UNIT", testFiles)
          junit testFiles
        }
      }
    }
    tasks['Integration tests: wildfly'] = {
      node('Fedora') {
        ansicolor {
          unstash 'workspace'
          integrationTests('wildfly8')
        }
      }
    }
    tasks['Integration tests: jbosseap'] = {
      node('Fedora') {
        ansicolor {
          unstash 'workspace'
          integrationTests('jbosseap6')
        }
      }
    }
    tasks.failFast = true
    parallel tasks
  }
  // TODO in case of failure, notify culprits via IRC and/or email
}

def archiveIfUnstable(pattern) {
  // if tests have failed currentBuild.result will be 'UNSTABLE'
  if (currentBuild.result != null) {
      step([$class: 'ArtifactArchiver', artifacts: pattern])
  }
}
def archiveArtifacts(pattern) {
  step([$class: 'ArtifactArchiver', artifacts: pattern, fingerprint: true, onlyIfSuccessful: true])
}
def integrationTests(def appserver) {
  xvfb {
    withPorts {
      // Run the maven build
      sh """./mvnw verify \
                   --batch-mode \
                   --settings .travis-settings.xml \
                   -DstaticAnalysis=false \
                   -Dcheckstyle.skip \
                   -Dappserver=$appserver \
                   -DallFuncTests \
                   -Dmaven.test.failure.ignore \
                   -Dmaven.main.skip \
                   -Dgwt.compiler.skip \
                   -Dmaven.war.skip \
                   -DexcludeFrontend \
      """
      // -Dmaven.war.skip (but we might need zanata-test-war)

      // TODO might need some or all of these:
      // -Dfunctional-test - probably obsolete
      // -Dwebdriver.display=$DISPLAY
      // -Dcargo.debug.jvm.args= -Dwebdriver.type=chrome -Dwebdriver.chrome.driver=/opt/chromedriver

    }
  }
  def testFiles = '**/target/failsafe-reports/TEST-*.xml'
  setJUnitPrefix(appserver.toUpperCase(), testFiles)
  junit testFiles
  archiveIfUnstable '*/target/**/*.log,*/target/screenshots/**,**/target/site/jacoco/**,**/target/site/xref/**'
}

// from https://issues.jenkins-ci.org/browse/JENKINS-27395?focusedCommentId=256459&page=com.atlassian.jira.plugin.system.issuetabpanels:comment-tabpanel#comment-256459
def setJUnitPrefix(prefix, files) {
  // add prefix to qualified classname
  sh "shopt -s globstar && sed -i \"s/\\(<testcase .*classname=['\\\"]\\)\\([a-z]\\)/\\1${prefix}.\\2/g\" $files"
}
