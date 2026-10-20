import unittest

from prohibir_tokens_persistentes import find_persistent_auth_writes


class ProhibirTokensPersistentesTests(unittest.TestCase):
    def test_blocks_local_and_session_storage_auth_tokens(self):
        patch = "\n".join(
            [
                "*** Begin Patch",
                "*** Update File: src/session.ts",
                '+localStorage.setItem("accessToken", accessToken);',
                '+window.sessionStorage.setItem("theme-session", sessionToken);',
                "*** End Patch",
            ]
        )
        self.assertEqual(
            find_persistent_auth_writes(patch),
            ["src/session.ts", "src/session.ts"],
        )

    def test_blocks_client_written_auth_cookies(self):
        patch = "*** Begin Patch\n*** Update File: src/session.ts\n+document.cookie = `auth-token=${token}`;\n*** End Patch"
        self.assertEqual(find_persistent_auth_writes(patch), ["src/session.ts"])

    def test_allows_non_auth_preferences_reads_comments_and_non_source_files(self):
        patch = "\n".join(
            [
                "*** Begin Patch",
                "*** Update File: src/preferences.ts",
                '+localStorage.setItem("theme", theme);',
                '+// Do not call localStorage.setItem("accessToken", token).',
                "*** Update File: docs/example.ts",
                '+localStorage.setItem("accessToken", accessToken);',
                "*** End Patch",
            ]
        )
        self.assertEqual(find_persistent_auth_writes(patch), [])


if __name__ == "__main__":
    unittest.main()
