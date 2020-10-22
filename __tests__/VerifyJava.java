public class VerifyJava {
    public static void main(String[] args) {
        if (args.length != 4) throw new IllegalArgumentException("Expected 3 arguments: " + args.length);
        String expectedJavaVersion = args[0];
        String expectedVendor = args[1];
        String expectedJavaHome = args[2];
        String javaVersionOutput = args[3];
        
        assertEqual(System.getProperty("java.version"), expectedJavaVersion, "Unexpected version");
        assertEqual(System.getProperty("java.vendor"), expectedVendor, "Unexpected vendor");
        assertEqual(System.getProperty("java.home"), expectedJavaVersion, "Unexpected java.home");
        assertEqual(expectedJavaVersion, javaVersionOutput, "Unexpected output version");
    }

    private static void assertEqual(String actual, String expected, String message) {
        if (!actual.equals(expected)) {
            error(message + " (expected = '" + expected + "', actual = '" + actual + "')");
        }
    }

    private static void error(String reason) {
        System.out.println("ERROR: " + reason);
        System.exit(1);
    }
}
