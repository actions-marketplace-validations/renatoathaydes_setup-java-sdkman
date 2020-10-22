import java.nio.file.Path;
import java.nio.file.Paths;

public class VerifyJava {
    public static void main(String[] args) {
        if (args.length != 5) {
            throw new IllegalArgumentException("Expected 5 arguments, given " + args.length);
        }
        
        String expectedJavaVersion = args[0];
        String expectedVendor = args[1];
        String expectedJavaHome = args[2];
        String javaVersionOutput = args[3];
        String expectedJavaVersionOutput = args[4];

        assertEqual(System.getProperty("java.version"), expectedJavaVersion, "Unexpected version");
        assertEqual(System.getProperty("java.vendor"), expectedVendor, "Unexpected vendor");
        assertEqual(System.getenv("JAVA_HOME"), expectedJavaHome, "Unexpected JAVA_HOME");
        assertEqual(javaVersionOutput, expectedJavaVersionOutput, "Unexpected output version");
        
        assertWithinJavaHome(System.getenv("JAVA_HOME"), System.getProperty("java.home"));
    }

    private static void assertEqual(String actual, String expected, String message) {
        if (!actual.equals(expected)) {
            error(message + " (expected = '" + expected + "', actual = '" + actual + "')");
        }
    }

    private static void assertWithinJavaHome(String javaHomeEnv, String javaHomeProp) {
        Path env = Paths.get(javaHomeEnv);
        Path prop = Paths.get(javaHomeProp);
        if (!prop.startsWith(env)) {
            error("Java process java.home (" + prop + ") is not under JAVA_HOME (" + env + ")");
        }
    }

    private static void error(String reason) {
        System.out.println("ERROR: " + reason);
        System.exit(1);
    }
}
