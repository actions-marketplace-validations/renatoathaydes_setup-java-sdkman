# setup-java-sdkman

<p align="left">
  <a href="https://github.com/renatoathaydes/setup-java-sdkman"><img alt="GitHub Actions status" src="https://github.com/renatoathaydes/setup-java-sdkman/workflows/Main%20workflow/badge.svg"></a>
</p>

This action sets up a java environment for use in actions by:

- Downloading and installing [SDKMAN!](https://sdkman.io)
- Running `sdk install java <java-version>`, which adds Java to the `PATH`, sets `JAVA_HOME` etc.
  See [SDKMAN!](http://sdkman.io/jdks) for available JDK versions.
- registering problem matchers for error output

As this action installs SDKMAN!, after it runs, you can run any SDKMAN! command to, for example,
install [other SDKs](https://sdkman.io/sdks), including Gradle/Maven/SpringBoot etc.

See this project's own
[workflow.yml](.github/workflows/workflow.yml) for an example in step `Verify sdk command reports Java 11`.

[Latest Version](https://github.com/renatoathaydes/setup-java-sdkman/releases)

# Usage

See [action.yml](action.yml)

## Basic

```yaml
steps:
- uses: actions/checkout@v2
- uses: renatoathaydes/setup-java-sdkman@v2.x
  with:
    java-version: '11.0.2-open' # The SDKMAN! JDK version to use.
    architecture: x64 # (x64 or x86) - defaults to x64
- run: java -cp java HelloWorldApp
```

## Matrix Testing

```yaml
jobs:
  build:
    runs-on: ubuntu-16.04
    strategy:
      matrix:
        java: [ "8.0.265-zulu", "11.0.2-open" ]
    name: Java ${{ matrix.java }} sample
    steps:
      - uses: actions/checkout@v2
      - name: Setup java
        uses: renatoathaydes/setup-java-sdkman@v2.x
        with:
          java-version: ${{ matrix.java }}
      - run: java -cp java HelloWorldApp
```

## Publishing using Apache Maven

```yaml
jobs:
  build:

    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2
    - name: Set up JDK 1.8
      uses: renatoathaydes/setup-java-sdkman@v2.x
      with:
        java-version: "8.0.265-zulu"

    - name: Build with Maven
      run: mvn -B package --file pom.xml

    - name: Publish to GitHub Packages Apache Maven
      run: mvn deploy
      env:
        GITHUB_TOKEN: ${{ github.token }} # GITHUB_TOKEN is the default env for the password

    - name: Set up Apache Maven Central
      uses: renatoathaydes/setup-java-sdkman@v2.x
      with: # running setup-java again overwrites the settings.xml
        java-version: 8.0.265-zulu
        server-id: maven # Value of the distributionManagement/repository/id field of the pom.xml
        server-username: MAVEN_USERNAME # env variable for username in deploy
        server-password: MAVEN_CENTRAL_TOKEN # env variable for token in deploy
        gpg-private-key: ${{ secrets.MAVEN_GPG_PRIVATE_KEY }} # Value of the GPG private key to import
        gpg-passphrase: MAVEN_GPG_PASSPHRASE # env variable for GPG private key passphrase

    - name: Publish to Apache Maven Central
      run: mvn deploy
      env:
        MAVEN_USERNAME: maven_username123
        MAVEN_CENTRAL_TOKEN: ${{ secrets.MAVEN_CENTRAL_TOKEN }}
        MAVEN_GPG_PASSPHRASE: ${{ secrets.MAVEN_GPG_PASSPHRASE }}
```

The two `settings.xml` files created from the above example look like the following.

`settings.xml` file created for the first deploy to GitHub Packages
```xml
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 https://maven.apache.org/xsd/settings-1.0.0.xsd">
  <servers>
    <server>
      <id>github</id>
      <username>${env.GITHUB_ACTOR}</username>
      <password>${env.GITHUB_TOKEN}</password>
    </server>
    <server>
      <id>gpg.passphrase</id>
      <passphrase>${env.GPG_PASSPHRASE}</passphrase>
    </server>
  </servers>
</settings>
```

`settings.xml` file created for the second deploy to Apache Maven Central

```xml
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 https://maven.apache.org/xsd/settings-1.0.0.xsd">
  <servers>
    <server>
      <id>maven</id>
      <username>${env.MAVEN_USERNAME}</username>
      <password>${env.MAVEN_CENTRAL_TOKEN}</password>
    </server>
    <server>
      <id>gpg.passphrase</id>
      <passphrase>${env.MAVEN_GPG_PASSPHRASE}</passphrase>
    </server>
  </servers>
</settings>
```

***NOTE: The `settings.xml` file is created in the Actions $HOME directory. If you have an existing `settings.xml` file at that location, it will be overwritten. See below for using the `settings-path` to change your `settings.xml` file location.***

If `gpg-private-key` input is provided, the private key will be written to a file in the runner's temp directory, the private key file will be imported into the GPG keychain, and then the file will be promptly removed before proceeding with the rest of the setup process. A cleanup step will remove the imported private key from the GPG keychain after the job completes regardless of the job status. This ensures that the private key is no longer accessible on self-hosted runners and cannot "leak" between jobs (hosted runners are always clean instances).

See the help docs on [Publishing a Package](https://help.github.com/en/github/managing-packages-with-github-packages/configuring-apache-maven-for-use-with-github-packages#publishing-a-package) for more information on the `pom.xml` file.

## Publishing using Gradle

```yaml
jobs:

  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2

    - name: Set up JDK 1.8
      uses: renatoathaydes/setup-java-sdkman@v2.x
      with:
        java-version: "8.0.265-zulu"

    - name: Build with Gradle
      run: gradle build

    - name: Publish to GitHub Packages
      run: gradle publish
      env:
        USERNAME: ${{ github.actor }}
        PASSWORD: ${{ secrets.GITHUB_TOKEN }}
```

***NOTE: The `USERNAME` and `PASSWORD` need to correspond to the credentials environment variables used in the publishing section of your `build.gradle`.***

See the help docs on [Publishing a Package with Gradle](https://help.github.com/en/github/managing-packages-with-github-packages/configuring-gradle-for-use-with-github-packages#example-using-gradle-groovy-for-a-single-package-in-a-repository) for more information on the `build.gradle` configuration file.

## Apache Maven with a settings path

When using an Actions self-hosted runner with multiple shared runners the default `$HOME` directory can be shared by a number runners at the same time which could overwrite existing settings file. Setting the `settings-path` variable allows you to choose a unique location for your settings file.

```yaml
jobs:
  build:

    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2
    - name: Set up JDK 1.8 for Shared Runner
      uses: renatoathaydes/setup-java-sdkman@v2.x
      with:
        java-version: "8.0.265-zulu"
        server-id: github # Value of the distributionManagement/repository/id field of the pom.xml
        settings-path: ${{ github.workspace }} # location for the settings.xml file

    - name: Build with Maven
      run: mvn -B package --file pom.xml

    - name: Publish to GitHub Packages Apache Maven
      run: mvn deploy -s $GITHUB_WORKSPACE/settings.xml
      env:
        GITHUB_TOKEN: ${{ github.token }}
```

# License

The scripts and documentation in this project are released under the [MIT License](LICENSE)

# Contributions

Contributions are welcome!  See [Contributor's Guide](docs/contributors.md)
